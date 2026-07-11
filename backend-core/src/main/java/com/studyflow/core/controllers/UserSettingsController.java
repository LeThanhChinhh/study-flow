package com.studyflow.core.controllers;

import com.studyflow.core.dtos.settings.UpdateUserSettingsRequest;
import com.studyflow.core.dtos.settings.UserSettingsResponse;
import com.studyflow.core.services.UserSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user-settings")
public class UserSettingsController {

    private final UserSettingsService userSettingsService;

    public UserSettingsController(UserSettingsService userSettingsService) {
        this.userSettingsService = userSettingsService;
    }

    @GetMapping
    public ResponseEntity<UserSettingsResponse> getUserSettings(Authentication authentication) {
        UserSettingsResponse response = userSettingsService.getUserSettings(authentication);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<UserSettingsResponse> updateUserSettings(Authentication authentication,
                                                                   @Valid @RequestBody UpdateUserSettingsRequest request) {
        UserSettingsResponse response = userSettingsService.updateUserSettings(authentication, request);
        return ResponseEntity.ok(response);
    }
}
