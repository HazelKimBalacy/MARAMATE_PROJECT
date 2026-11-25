package edu.cit.balacy.MaraMate.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetMailer {

	private final JavaMailSender mailSender;
	private final String from;
	private final String frontendUrl;

	public PasswordResetMailer(
			JavaMailSender mailSender,
			@Value("${maramate.mail.from}") String from,
			@Value("${maramate.frontend-url}") String frontendUrl) {
		this.mailSender = mailSender;
		this.from = from;
		this.frontendUrl = frontendUrl.replaceAll("/+$", "");
	}

	public void sendResetLink(String email, String token) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(from);
		message.setTo(email);
		message.setSubject("Reset your MaraMate password");
		message.setText("""
				We received a request to reset your MaraMate password.

				Use this one-time link within 30 minutes:
				%s/reset-password?token=%s

				If you did not request this, you can ignore this email.
				""".formatted(frontendUrl, token));
		mailSender.send(message);
	}
}
