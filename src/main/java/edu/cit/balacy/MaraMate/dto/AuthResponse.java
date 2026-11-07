package edu.cit.balacy.MaraMate.dto;

public record AuthResponse(String token, long expiresInSeconds, UserResponse user) {
}
