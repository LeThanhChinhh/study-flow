package com.studyflow.core.services;

import com.studyflow.core.dtos.auth.LoginRequest;
import com.studyflow.core.dtos.auth.RegisterRequest;
import com.studyflow.core.dtos.auth.UpdateUsernameRequest;
import com.studyflow.core.dtos.auth.UserProfileResponse;
import com.studyflow.core.entities.User;
import com.studyflow.core.exceptions.ConflictException;
import com.studyflow.core.repositories.UserRepository;
import com.studyflow.core.repositories.UserSettingsRepository;
import com.studyflow.core.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserSettingsRepository userSettingsRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerRejectsDuplicateUsernameAsConflict() {
        RegisterRequest request = new RegisterRequest("taken_name", "new@example.com", "Password1!");
        when(userRepository.existsByUsernameIgnoreCase("taken_name")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Username already exists");
    }

    @Test
    void loginRejectsInvalidCredentialsAsUnauthorizedError() {
        LoginRequest request = new LoginRequest("missing@example.com", "Password1!");
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByUsernameIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void updateUsernameUpdatesCurrentUser() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, "old_name");
        Authentication authentication = authenticatedAs(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.existsByUsernameIgnoreCaseAndIdNot("new_name", userId)).thenReturn(false);
        when(userRepository.saveAndFlush(user)).thenReturn(user);

        UserProfileResponse response = authService.updateUsername(
                authentication,
                new UpdateUsernameRequest("  new_name  ")
        );

        assertThat(response.username()).isEqualTo("new_name");
        assertThat(user.getUsername()).isEqualTo("new_name");
        verify(userRepository).saveAndFlush(user);
    }

    @Test
    void updateUsernameRejectsDuplicateIgnoringCase() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, "current_name");
        Authentication authentication = authenticatedAs(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.existsByUsernameIgnoreCaseAndIdNot("Taken_Name", userId)).thenReturn(true);

        assertThatThrownBy(() -> authService.updateUsername(
                authentication,
                new UpdateUsernameRequest("Taken_Name")
        ))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Username already exists");

        verify(userRepository, never()).saveAndFlush(user);
    }

    private static Authentication authenticatedAs(UUID userId) {
        return new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of());
    }

    private static User user(UUID id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail("student@example.com");
        user.setRole("ROLE_USER");
        user.setCurrentStreak(0);
        user.setHighestStreak(0);
        return user;
    }
}
