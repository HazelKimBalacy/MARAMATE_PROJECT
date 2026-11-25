package edu.cit.balacy.MaraMate.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
		@NotBlank(message = "Enter your full name.")
		@Size(max = 120, message = "Full name must be 120 characters or fewer.")
		String fullName,

		@NotBlank(message = "Enter your email address.")
		@Email(message = "Enter a valid email address, like name@example.com.")
		@Size(max = 160, message = "Email must be 160 characters or fewer.")
		String email,

		@NotBlank(message = "Enter your mobile number.")
		@Pattern(regexp = "^(09|\\+639)\\d{9}$",
				message = "Use a Philippine mobile number, like 09171234567.")
		String mobileNumber
) {
}
