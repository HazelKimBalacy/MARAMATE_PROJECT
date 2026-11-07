package edu.cit.balacy.MaraMate.security;

import edu.cit.balacy.MaraMate.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class JwtService {

	private final JwtEncoder encoder;
	private final Duration lifetime;

	public JwtService(JwtEncoder encoder, @Value("${maramate.jwt.expiry-hours}") long expiryHours) {
		this.encoder = encoder;
		this.lifetime = Duration.ofHours(expiryHours);
	}

	public String issue(User user) {
		Instant now = Instant.now();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer("maramate")
				.subject(String.valueOf(user.getId()))
				.issuedAt(now)
				.expiresAt(now.plus(lifetime))
				.claim("role", user.getRole().name())
				.build();
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}

	public long lifetimeSeconds() {
		return lifetime.toSeconds();
	}
}
