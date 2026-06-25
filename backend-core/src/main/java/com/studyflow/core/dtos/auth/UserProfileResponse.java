package com.studyflow.core.dtos.auth;

import com.studyflow.core.entities.User;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String username,
        String email,
        String role,
        Integer currentStreak,
        Integer highestStreak
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCurrentStreak(),
                user.getHighestStreak()
        );
    }
}