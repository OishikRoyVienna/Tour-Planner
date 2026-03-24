package com.tourplanner.service;

import com.tourplanner.model.User;
import com.tourplanner.repository.UserRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

  private static final Logger logger = LogManager.getLogger(AuthService.class);

  @Autowired
  private UserRepository userRepository;

  public boolean login(String username, String password) {
    logger.info("Login attempt for user: {}", username);
    Optional<User> user = userRepository.findByUsername(username);

    if (user.isPresent() && user.get().getPassword().equals(password)) {
      logger.info("Login successful for user: {}", username);
      return true;
    }

    logger.warn("Login failed for user: {}", username);
    return false;
  }

  public User register(String username, String password) {
    logger.info("Register attempt for user: {}", username);

    if (userRepository.findByUsername(username).isPresent()) {
      logger.warn("User already exists: {}", username);
      return null;
    }

    User user = new User();
    user.setUsername(username);
    user.setPassword(password);
    userRepository.save(user);
    logger.info("User registered successfully: {}", username);
    return user;
  }
}
