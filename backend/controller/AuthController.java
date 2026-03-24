package com.tourplanner.controller;

import com.tourplanner.service.AuthService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

  private static final Logger logger = LogManager.getLogger(AuthController.class);

  @Autowired
  private AuthService authService;

  @PostMapping("/login")
  public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
    logger.info("POST /api/auth/login");

    Map<String, Object> response = new HashMap<>();
    boolean success = authService.login(
      credentials.get("username"),
      credentials.get("password")
    );

    if (success) {
      response.put("success", true);
      response.put("message", "Login successful");
      return ResponseEntity.ok(response);
    } else {
      response.put("success", false);
      response.put("message", "Invalid credentials");
      return ResponseEntity.status(401).body(response);
    }
  }

  @PostMapping("/register")
  public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> credentials) {
    logger.info("POST /api/auth/register");

    Map<String, Object> response = new HashMap<>();
    User user = authService.register(
      credentials.get("username"),
      credentials.get("password")
    );

    if (user != null) {
      response.put("success", true);
      response.put("message", "Registration successful");
      return ResponseEntity.status(201).body(response);
    } else {
      response.put("success", false);
      response.put("message", "User already exists");
      return ResponseEntity.status(400).body(response);
    }
  }
}
