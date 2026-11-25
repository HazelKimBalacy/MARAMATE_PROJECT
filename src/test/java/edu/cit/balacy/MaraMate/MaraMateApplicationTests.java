package edu.cit.balacy.MaraMate;

import edu.cit.balacy.MaraMate.model.AccountStatus;
import edu.cit.balacy.MaraMate.model.Role;
import edu.cit.balacy.MaraMate.model.User;
import edu.cit.balacy.MaraMate.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class MaraMateApplicationTests {

	@Autowired
	private UserRepository users;

	@Test
	void contextLoads() {
	}

	@Test
	@Transactional
	void resetTokenHashCanBeQueriedWithAWriteLock() {
		User user = new User();
		user.setFullName("Test Moviegoer");
		user.setEmail("reset-token-test@example.com");
		user.setMobileNumber("09171234567");
		user.setPasswordHash("encoded-password");
		user.setRole(Role.MOVIEGOER);
		user.setStatus(AccountStatus.ACTIVE);
		user.setPasswordResetTokenHash("a".repeat(64));
		user.setPasswordResetExpiresAt(Instant.now().plusSeconds(1800));
		User saved = users.saveAndFlush(user);

		User found = users.findByPasswordResetTokenHashForUpdate("a".repeat(64)).orElseThrow();
		User foundByEmail = users.findByEmailForUpdate("reset-token-test@example.com").orElseThrow();

		assertEquals(saved.getId(), found.getId());
		assertEquals(saved.getId(), foundByEmail.getId());
	}
}
