package edu.cit.balacy.MaraMate.dto;

import edu.cit.balacy.MaraMate.model.Role;
import jakarta.validation.constraints.*;

public record RegisterRequest(
		@NotBlank(message = "Enter your full name.")
		@Size(max = 120, message = "Full name must be 120 characters or fewer.")
		String fullName,

		@NotBlank(message = "Enter your email address.")
		@Email(message = "Enter a valid email address, like name@example.com.")
		@Size(max = 160)
		String email,

		@NotBlank(message = "Enter your mobile number.")
		@Pattern(regexp = "^(09|\\+639)\\d{9}$",
				message = "Use a Philippine mobile number, like 09171234567.")
		String mobileNumber,

		@NotBlank(message = "Create a password.")
		@Size(min = 8, max = 72, message = "Password must be 8 to 72 characters.")
		String password,

		// Only MOVIEGOER or ORGANIZER may self-register (FR-001, FR-004). Defaults to MOVIEGOER.
		Role role
) {
}
