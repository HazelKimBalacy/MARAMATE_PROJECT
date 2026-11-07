package edu.cit.balacy.MaraMate.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
		@NotBlank(message = "Enter your email address.") String email,
		@NotBlank(message = "Enter your password.") String password
) {
}
