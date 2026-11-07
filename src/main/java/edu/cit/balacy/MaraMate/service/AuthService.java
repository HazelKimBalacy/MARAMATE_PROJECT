package edu.cit.balacy.MaraMate.service;

import edu.cit.balacy.MaraMate.dto.*;
import edu.cit.balacy.MaraMate.exception.ApiException;
import edu.cit.balacy.MaraMate.model.AccountStatus;
import edu.cit.balacy.MaraMate.model.Role;
import edu.cit.balacy.MaraMate.model.User;
import edu.cit.balacy.MaraMate.repository.UserRepository;
import edu.cit.balacy.MaraMate.security.JwtService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthService {

	private final UserRepository users;
	private final PasswordEncoder encoder;
	private final JwtService jwt;

	public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
		this.users = users;
		this.encoder = encoder;
		this.jwt = jwt;
	}

	public UserResponse register(RegisterRequest req) {
		Role role = req.role() == null ? Role.MOVIEGOER : req.role();
		// Only moviegoers and organizers can sign themselves up. Staff and admins are created by an Administrator.
		if (role != Role.MOVIEGOER && role != Role.ORGANIZER) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Choose Moviegoer or Organizer.", "role");
		}

		String email = req.email().trim().toLowerCase(Locale.ROOT);
		if (users.existsByEmail(email)) {
			throw emailTaken();
		}

		User user = new User();
		user.setFullName(req.fullName().trim());
		user.setEmail(email);
		user.setMobileNumber(normalizeMobile(req.mobileNumber()));
		user.setPasswordHash(encoder.encode(req.password()));
		user.setRole(role);
		// Organizer accounts wait for administrator approval (FR-004, FR-067).
		user.setStatus(role == Role.ORGANIZER ? AccountStatus.PENDING : AccountStatus.ACTIVE);

		try {
			return UserResponse.from(users.save(user));
		} catch (DataIntegrityViolationException e) { // two sign-ups with the same email at once
			throw emailTaken();
		}
	}

	public AuthResponse login(LoginRequest req) {
		String email = req.email().trim().toLowerCase(Locale.ROOT);
		User user = users.findByEmail(email)
				.filter(u -> encoder.matches(req.password(), u.getPasswordHash()))
				.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect email or password."));

		if (user.getStatus() == AccountStatus.PENDING) {
			throw new ApiException(HttpStatus.FORBIDDEN,
					"Your organizer account is waiting for administrator approval. You can log in once it is approved.");
		}
		if (user.getStatus() == AccountStatus.SUSPENDED) {
			throw new ApiException(HttpStatus.FORBIDDEN, "This account is suspended. Contact an administrator.");
		}
		return new AuthResponse(jwt.issue(user), jwt.lifetimeSeconds(), UserResponse.from(user));
	}

	public UserResponse me(Long userId) {
		return users.findById(userId)
				.map(UserResponse::from)
				.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Your session is no longer valid. Log in again."));
	}

	/** Stores +639XXXXXXXXX as 09XXXXXXXXX so every number has one format. */
	private static String normalizeMobile(String raw) {
		String m = raw.trim();
		return m.startsWith("+63") ? "0" + m.substring(3) : m;
	}

	private static ApiException emailTaken() {
		return new ApiException(HttpStatus.CONFLICT, "An account with this email already exists. Log in instead.", "email");
	}
}
