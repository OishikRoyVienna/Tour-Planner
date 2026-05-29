package tourplanner.backend.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import tourplanner.backend.dto.UserDTO;
import tourplanner.backend.exception.ValidationException;
import tourplanner.backend.model.User;
import tourplanner.backend.repository.UserRepository;

@Service
public class UserService {

    private static final Logger logger = LogManager.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public UserDTO register(UserDTO userDTO) {
        logger.info("Registering user: {}", userDTO.getUsername());

        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new ValidationException("Username already taken: " + userDTO.getUsername());
        }
        if (userDTO.getEmail() != null && !userDTO.getEmail().isBlank()
                && userRepository.existsByEmail(userDTO.getEmail())) {
            throw new ValidationException("Email already in use: " + userDTO.getEmail());
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setEmail(userDTO.getEmail());

        User saved = userRepository.save(user);
        logger.info("User registered successfully with id: {}", saved.getId());

        UserDTO result = new UserDTO();
        result.setId(saved.getId());
        result.setUsername(saved.getUsername());
        result.setEmail(saved.getEmail());
        return result;
    }

    public UserDTO login(String username, String password) {
        logger.info("Login attempt for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ValidationException("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            logger.warn("Failed login attempt for user: {}", username);
            throw new ValidationException("Invalid username or password");
        }

        logger.info("User logged in successfully: {}", username);

        UserDTO result = new UserDTO();
        result.setId(user.getId());
        result.setUsername(user.getUsername());
        result.setEmail(user.getEmail());
        return result;
    }
}
