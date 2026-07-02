package com.studyflow.core.services;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CurrentUserService {

    public UUID getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Unauthenticated");
        }
        return UUID.fromString(authentication.getName());
    }
}
