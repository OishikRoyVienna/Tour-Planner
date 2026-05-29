package tourplanner.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import tourplanner.backend.dto.UserDTO;
import tourplanner.backend.exception.ValidationException;
import tourplanner.backend.model.User;
import tourplanner.backend.repository.UserRepository;
import tourplanner.backend.service.UserService;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UserDTO testUserDTO;
    private User savedUser;

    @BeforeEach
    void setUp() {
        testUserDTO = new UserDTO();
        testUserDTO.setUsername("testuser");
        testUserDTO.setPassword("password123");
        testUserDTO.setEmail("test@example.com");

        savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("testuser");
        savedUser.setPassword("$2a$hashed");
        savedUser.setEmail("test@example.com");
    }

    @Test
    void register_success() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$hashed");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserDTO result = userService.register(testUserDTO);

        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("testuser");
        assertThat(result.getId()).isEqualTo(1L);
        verify(passwordEncoder).encode("password123");
    }

    @Test
    void register_duplicateUsername_throws() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(testUserDTO))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Username already taken");
    }

    @Test
    void register_duplicateEmail_throws() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(testUserDTO))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Email already in use");
    }

    @Test
    void login_success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches("password123", "$2a$hashed")).thenReturn(true);

        UserDTO result = userService.login("testuser", "password123");

        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("testuser");
    }

    @Test
    void login_userNotFound_throws() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login("unknown", "password"))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void login_wrongPassword_throws() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches("wrongpass", "$2a$hashed")).thenReturn(false);

        assertThatThrownBy(() -> userService.login("testuser", "wrongpass"))
                .isInstanceOf(ValidationException.class);
    }
}
