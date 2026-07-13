package com.studyflow.core.services;

import com.studyflow.core.dtos.auth.AuthResponse;
import com.studyflow.core.dtos.auth.AuthUserResponse;
import com.studyflow.core.dtos.auth.LoginRequest;
import com.studyflow.core.dtos.auth.RegisterRequest;
import com.studyflow.core.dtos.auth.UpdateUsernameRequest;
import com.studyflow.core.entities.User;
import com.studyflow.core.entities.UserSettings;
import com.studyflow.core.exceptions.ConflictException;
import com.studyflow.core.repositories.UserRepository;
import com.studyflow.core.repositories.UserSettingsRepository;
import com.studyflow.core.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.studyflow.core.dtos.auth.UserProfileResponse;
import org.springframework.security.core.Authentication;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            UserSettingsRepository userSettingsRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthUserResponse register(RegisterRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole("ROLE_USER");
        user.setCurrentStreak(0);
        user.setHighestStreak(0);

        User savedUser = userRepository.save(user);

        UserSettings settings = new UserSettings();
        settings.setUser(savedUser);
        userSettingsRepository.save(settings);

        return AuthUserResponse.from(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.identifier().trim();

        User user = userRepository.findByEmail(identifier.toLowerCase())
                .or(() -> userRepository.findByUsernameIgnoreCase(identifier))
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        boolean passwordMatches = passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        );

        if (!passwordMatches) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String accessToken = jwtService.generateToken(user);

        return AuthResponse.of(accessToken, AuthUserResponse.from(user));
    }

    @Transactional
    public UserProfileResponse updateUsername(
            Authentication authentication,
            UpdateUsernameRequest request
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Unauthenticated");
        }

        UUID userId = UUID.fromString(authentication.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String username = request.username().trim();
        if (username.equals(user.getUsername())) {
            return UserProfileResponse.from(user);
        }

        if (userRepository.existsByUsernameIgnoreCaseAndIdNot(username, userId)) {
            throw new ConflictException("Username already exists");
        }

        user.setUsername(username);
        User savedUser = userRepository.save(user);
        return UserProfileResponse.from(savedUser);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Unauthenticated");
        }

        UUID userId = UUID.fromString(authentication.getName());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return UserProfileResponse.from(user);
    }
}