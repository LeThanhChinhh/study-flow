package com.studyflow.core.repositories;

import com.studyflow.core.entities.Material;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MaterialRepository extends JpaRepository<Material, UUID> {

    Optional<Material> findByJobIdAndUserId(String jobId, UUID userId);

    Optional<Material> findByIdAndUserId(UUID id, UUID userId);
}
