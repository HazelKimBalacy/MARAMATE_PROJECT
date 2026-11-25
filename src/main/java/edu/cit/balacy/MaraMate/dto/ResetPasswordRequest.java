package edu.cit.balacy.MaraMate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
		@NotBlank(message = "This password reset link is invalid.")
		@Size(max = 128, message = "This password reset link is invalid.")
		String token,

		@NotBlank(message = "Enter a new password.")
		@Size(min = 8, max = 72, message = "Password must be 8 to 72 characters.")
		String newPassword,

		@NotBlank(message = "Confirm your new password.")
		String confirmNewPassword
) {
}
