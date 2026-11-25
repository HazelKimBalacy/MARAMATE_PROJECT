package edu.cit.balacy.MaraMate.service;

import edu.cit.balacy.MaraMate.dto.ForgotPasswordRequest;
import edu.cit.balacy.MaraMate.dto.ChangePasswordRequest;
import edu.cit.balacy.MaraMate.dto.MessageResponse;
import edu.cit.balacy.MaraMate.dto.ResetPasswordRequest;
import edu.cit.balacy.MaraMate.dto.UpdateProfileRequest;
import edu.cit.balacy.MaraMate.exception.ApiException;
import edu.cit.balacy.MaraMate.model.User;
import edu.cit.balacy.MaraMate.repository.UserRepository;
import edu.cit.balacy.MaraMate.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {

	@Mock
	private UserRepository users;

	@Mock
	private JwtService jwt;

	@Mock
	private PasswordResetMailer resetMailer;

	private PasswordEncoder encoder;
	private AuthService auth;

	@BeforeEach
	void setUp() {
		encoder = new BCryptPasswordEncoder(4);
		auth = new AuthService(users, encoder, jwt, resetMailer);
	}

	@Test
	void resetPasswordConsumesTheTokenAfterSuccessfulUse() throws Exception {
		User user = new User();
		user.setId(7L);
		user.setEmail("vei@example.com");
		user.setPasswordHash(encoder.encode("old-password"));
		when(users.findByEmailForUpdate("vei@example.com")).thenReturn(Optional.of(user));

		auth.requestPasswordReset(new ForgotPasswordRequest("vei@example.com"));

		ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
		verify(resetMailer).sendResetLink(eq("vei@example.com"), tokenCaptor.capture());
		String token = tokenCaptor.getValue();
		String tokenHash = hash(token);
		assertEquals(tokenHash, user.getPasswordResetTokenHash());
		assertTrue(user.getPasswordResetExpiresAt().isAfter(Instant.now()));

		when(users.findByPasswordResetTokenHashForUpdate(tokenHash)).thenReturn(Optional.of(user));
		MessageResponse result = auth.resetPassword(
				new ResetPasswordRequest(token, "new-password", "new-password"));

		assertEquals("Your password has been reset. You can now log in.", result.message());
		assertTrue(encoder.matches("new-password", user.getPasswordHash()));
		assertFalse(encoder.matches("old-password", user.getPasswordHash()));
		assertNull(user.getPasswordResetTokenHash());
		assertNull(user.getPasswordResetExpiresAt());

		when(users.findByPasswordResetTokenHashForUpdate(tokenHash)).thenReturn(Optional.empty());
		assertThrows(ApiException.class, () -> auth.resetPassword(
				new ResetPasswordRequest(token, "another-password", "another-password")));
	}

	@Test
	void resetPasswordRejectsAnExpiredToken() throws Exception {
		User user = new User();
		user.setPasswordHash(encoder.encode("old-password"));
		user.setPasswordResetTokenHash(hash("expired-token"));
		user.setPasswordResetExpiresAt(Instant.now().minusSeconds(1));
		when(users.findByPasswordResetTokenHashForUpdate(hash("expired-token"))).thenReturn(Optional.of(user));

		assertThrows(ApiException.class, () -> auth.resetPassword(
				new ResetPasswordRequest("expired-token", "new-password", "new-password")));
		assertTrue(encoder.matches("old-password", user.getPasswordHash()));
	}

	@Test
	void changePasswordRequiresCurrentPasswordAndReplacesTheOldHash() {
		User user = new User();
		user.setId(7L);
		user.setPasswordHash(encoder.encode("old-password"));
		when(users.findByIdForUpdate(7L)).thenReturn(Optional.of(user));

		auth.changePassword(7L, new ChangePasswordRequest(
				"old-password", "new-password", "new-password"));

		assertTrue(encoder.matches("new-password", user.getPasswordHash()));
		assertFalse(encoder.matches("old-password", user.getPasswordHash()));
	}

	@Test
	void forgotPasswordDoesNotRevealUnknownAccounts() {
		when(users.findByEmailForUpdate("missing@example.com")).thenReturn(Optional.empty());

		MessageResponse result = auth.requestPasswordReset(new ForgotPasswordRequest("missing@example.com"));

		assertEquals("If an account exists for this email, a password reset link will be sent.", result.message());
		verify(resetMailer, never()).sendResetLink(any(), any());
	}

	@Test
	void updateProfileNormalizesAndSavesOnlyTheAuthenticatedUser() {
		User user = new User();
		user.setId(7L);
		user.setFullName("Old Name");
		user.setEmail("old@example.com");
		user.setMobileNumber("09171234567");
		user.setPasswordResetTokenHash("old-reset-token");
		user.setPasswordResetExpiresAt(Instant.now().plusSeconds(1200));
		when(users.findByIdForUpdate(7L)).thenReturn(Optional.of(user));
		when(users.existsByEmailAndIdNot("new@example.com", 7L)).thenReturn(false);
		when(users.saveAndFlush(user)).thenReturn(user);

		var updated = auth.updateProfile(7L, new UpdateProfileRequest(
				" New Name ", "NEW@example.com", "+639171234567"));

		assertEquals("New Name", updated.fullName());
		assertEquals("new@example.com", updated.email());
		assertEquals("09171234567", updated.mobileNumber());
		assertNull(user.getPasswordResetTokenHash());
		assertNull(user.getPasswordResetExpiresAt());
		verify(users).findByIdForUpdate(7L);
	}

	private static String hash(String token) throws Exception {
		byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
		return HexFormat.of().formatHex(digest);
	}
}
