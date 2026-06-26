package com.studyflow.core.dtos.auth;

import com.studyflow.core.entities.User;

import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String username,
        String email,
        String role
) {
    public static AuthUserResponse from(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );
    }
}