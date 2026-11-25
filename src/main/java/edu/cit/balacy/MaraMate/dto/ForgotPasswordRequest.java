package edu.cit.balacy.MaraMate.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForgotPasswordRequest(
		@NotBlank(message = "Enter your email address.")
		@Email(message = "Enter a valid email address.")
		@Size(max = 160)
		String email
) {
}
