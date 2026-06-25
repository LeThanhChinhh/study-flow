package com.studyflow.core.controllers;

import com.studyflow.core.dtos.auth.AuthResponse;
import com.studyflow.core.dtos.auth.AuthUserResponse;
import com.studyflow.core.dtos.auth.LoginRequest;
import com.studyflow.core.dtos.auth.RegisterRequest;
import com.studyflow.core.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.studyflow.core.dtos.auth.UserProfileResponse;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthUserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
    @GetMapping("/me")
    public UserProfileResponse me(Authentication authentication) {
        return authService.getCurrentUser(authentication);
    }
}