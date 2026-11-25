package edu.cit.balacy.MaraMate.service;

import edu.cit.balacy.MaraMate.dto.*;
import edu.cit.balacy.MaraMate.exception.ApiException;
import edu.cit.balacy.MaraMate.model.AccountStatus;
import edu.cit.balacy.MaraMate.model.Role;
import edu.cit.balacy.MaraMate.model.User;
import edu.cit.balacy.MaraMate.repository.UserRepository;
import edu.cit.balacy.MaraMate.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

@Service
public class AuthService {

	private static final Logger log = LoggerFactory.getLogger(AuthService.class);
	private static final Duration RESET_TOKEN_LIFETIME = Duration.ofMinutes(30);
	private static final SecureRandom SECURE_RANDOM = new SecureRandom();
	private static final String RESET_REQUEST_MESSAGE =
			"If an account exists for this email, a password reset link will be sent.";

	private final UserRepository users;
	private final PasswordEncoder encoder;
	private final JwtService jwt;
	private final PasswordResetMailer resetMailer;

	public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt, PasswordResetMailer resetMailer) {
		this.users = users;
		this.encoder = encoder;
		this.jwt = jwt;
		this.resetMailer = resetMailer;
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

	@Transactional
	public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
		User user = users.findByIdForUpdate(userId)
				.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Your session is no longer valid. Log in again."));
		String email = req.email().trim().toLowerCase(Locale.ROOT);
		if (!email.equals(user.getEmail()) && users.existsByEmailAndIdNot(email, userId)) {
			throw emailTaken();
		}
		if (!email.equals(user.getEmail())) {
			clearPasswordReset(user);
		}

		user.setFullName(req.fullName().trim());
		user.setEmail(email);
		user.setMobileNumber(normalizeMobile(req.mobileNumber()));
		try {
			return UserResponse.from(users.saveAndFlush(user));
		} catch (DataIntegrityViolationException e) {
			throw emailTaken();
		}
	}

	@Transactional
	public MessageResponse changePassword(Long userId, ChangePasswordRequest req) {
		if (!Objects.equals(req.newPassword(), req.confirmNewPassword())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "New passwords do not match.", "confirmNewPassword");
		}
		User user = users.findByIdForUpdate(userId)
				.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Your session is no longer valid. Log in again."));
		if (!encoder.matches(req.currentPassword(), user.getPasswordHash())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect.", "currentPassword");
		}
		if (encoder.matches(req.newPassword(), user.getPasswordHash())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Choose a password you have not used for this account.", "newPassword");
		}

		user.setPasswordHash(encoder.encode(req.newPassword()));
		clearPasswordReset(user);
		users.save(user);
		return new MessageResponse("Your password was changed.");
	}

	@Transactional
	public MessageResponse requestPasswordReset(ForgotPasswordRequest req) {
		String email = req.email().trim().toLowerCase(Locale.ROOT);
		Optional<User> match = users.findByEmailForUpdate(email);
		if (match.isEmpty()) {
			return new MessageResponse(RESET_REQUEST_MESSAGE);
		}

		User user = match.get();
		String token = createResetToken();
		user.setPasswordResetTokenHash(hashResetToken(token));
		user.setPasswordResetExpiresAt(Instant.now().plus(RESET_TOKEN_LIFETIME));
		try {
			resetMailer.sendResetLink(user.getEmail(), token);
		} catch (MailException e) {
			log.error("Unable to deliver password reset email.", e);
			throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
					"Password recovery is temporarily unavailable. Please try again later.");
		}
		return new MessageResponse(RESET_REQUEST_MESSAGE);
	}

	@Transactional
	public MessageResponse resetPassword(ResetPasswordRequest req) {
		if (!Objects.equals(req.newPassword(), req.confirmNewPassword())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "New passwords do not match.", "confirmNewPassword");
		}
		User user = users.findByPasswordResetTokenHashForUpdate(hashResetToken(req.token()))
				.filter(u -> u.getPasswordResetExpiresAt() != null
						&& u.getPasswordResetExpiresAt().isAfter(Instant.now()))
				.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
						"This password reset link is invalid or has expired.", "token"));

		user.setPasswordHash(encoder.encode(req.newPassword()));
		clearPasswordReset(user);
		users.save(user);
		return new MessageResponse("Your password has been reset. You can now log in.");
	}

	private static void clearPasswordReset(User user) {
		user.setPasswordResetTokenHash(null);
		user.setPasswordResetExpiresAt(null);
	}

	private static String createResetToken() {
		byte[] bytes = new byte[32];
		SECURE_RANDOM.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	private static String hashResetToken(String token) {
		try {
			byte[] digest = MessageDigest.getInstance("SHA-256")
					.digest(token.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(digest);
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException("SHA-256 is required to hash password reset tokens.", e);
		}
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
