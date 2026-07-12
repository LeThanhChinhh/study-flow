package com.studyflow.core.services;

import com.studyflow.core.dtos.settings.UpdateUserSettingsRequest;
import com.studyflow.core.dtos.settings.UserSettingsResponse;
import com.studyflow.core.entities.User;
import com.studyflow.core.entities.UserSettings;
import com.studyflow.core.repositories.UserRepository;
import com.studyflow.core.repositories.UserSettingsRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserSettingsService {

    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public UserSettingsService(UserSettingsRepository userSettingsRepository,
                               UserRepository userRepository,
                               CurrentUserService currentUserService) {
        this.userSettingsRepository = userSettingsRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public UserSettingsResponse getUserSettings(Authentication authentication) {
        UUID userId = currentUserService.getCurrentUserId(authentication);
        UserSettings settings = getOrCreateSettings(userId);
        return mapToResponse(settings);
    }

    @Transactional
    public UserSettingsResponse updateUserSettings(Authentication authentication, UpdateUserSettingsRequest request) {
        UUID userId = currentUserService.getCurrentUserId(authentication);
        UserSettings settings = getOrCreateSettings(userId);

        settings.setPomodoroDuration(request.getPomodoroDuration());
        settings.setShortBreakDuration(request.getShortBreakDuration());

        UserSettings updatedSettings = userSettingsRepository.save(settings);
        return mapToResponse(updatedSettings);
    }

    private UserSettings getOrCreateSettings(UUID userId) {
        return userSettingsRepository.findById(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            UserSettings newSettings = new UserSettings();
            newSettings.setUser(user);
            return userSettingsRepository.save(newSettings);
        });
    }

    private UserSettingsResponse mapToResponse(UserSettings settings) {
        return new UserSettingsResponse(settings.getPomodoroDuration(), settings.getShortBreakDuration());
    }
}
