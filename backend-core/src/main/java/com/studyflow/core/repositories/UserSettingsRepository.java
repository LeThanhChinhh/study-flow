package com.studyflow.core.repositories;

import com.studyflow.core.entities.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserSettingsRepository extends JpaRepository<UserSettings, UUID> {
}