package edu.cit.balacy.MaraMate.dto;

import edu.cit.balacy.MaraMate.model.AccountStatus;
import edu.cit.balacy.MaraMate.model.Role;
import edu.cit.balacy.MaraMate.model.User;

public record UserResponse(Long id, String fullName, String email, String mobileNumber,
						   Role role, AccountStatus status) {

	public static UserResponse from(User u) {
		return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getMobileNumber(),
				u.getRole(), u.getStatus());
	}
}
