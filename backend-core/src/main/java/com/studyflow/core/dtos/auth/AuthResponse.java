package com.studyflow.core.dtos.auth;

public record AuthResponse(
        String accessToken,
        String tokenType,
        AuthUserResponse user
) {
    public static AuthResponse of(String accessToken, AuthUserResponse user) {
        return new AuthResponse(accessToken, "Bearer", user);
    }
}