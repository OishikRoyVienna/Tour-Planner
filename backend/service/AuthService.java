package com.tourplanner.service;

import com.tourplanner.model.RegisteredAccount;
import com.tourplanner.model.User;
import com.tourplanner.repository.UserRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

  private static final Logger logger = LogManager.getLogger(AuthService.class);

  private final Map<String, RegisteredAccount> inMemoryUsers = new ConcurrentHashMap<>();

  @Autowired
  private UserRepository userRepository;

  public boolean login(String username, String password) {
    logger.info("Login attempt for user: {}", username);

    RegisteredAccount mem = inMemoryUsers.get(username);
    if (mem != null && mem.getPassword().equals(password)) {
      logger.info("Login successful (in-memory) for user: {}", username);
      return true;
    }

    Optional<User> user = userRepository.findByUsername(username);
    if (user.isPresent() && user.get().getPassword().equals(password)) {
      logger.info("Login successful for user: {}", username);
      return true;
    }

    logger.warn("Login failed for user: {}", username);
    return false;
  }

  public RegisteredAccount register(
      String firstName,
      String lastName,
      String birthday,
      String email,
      String username,
      String password
  ) {
    logger.info("Register attempt for user: {}", username);

    if (username == null || username.isBlank()) {
      return null;
    }

    if (inMemoryUsers.containsKey(username) || userRepository.findByUsername(username).isPresent()) {
      logger.warn("User already exists: {}", username);
      return null;
    }

    RegisteredAccount account = new RegisteredAccount(
        firstName,
        lastName,
        birthday,
        email,
        username,
        password
    );
    inMemoryUsers.put(username, account);
    logger.info("User registered successfully (in-memory): {}", username);
    return account;
  }
}
