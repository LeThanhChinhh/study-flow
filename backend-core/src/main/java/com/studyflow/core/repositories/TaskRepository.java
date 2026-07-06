package com.studyflow.core.repositories;

import com.studyflow.core.entities.Task;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByUserIdOrderByOrderIndexAscCreatedAtDesc(UUID userId);

    List<Task> findByUserIdAndScheduledDateOrderByOrderIndexAsc(UUID userId, LocalDate scheduledDate);

    List<Task> findByUserIdAndStatusOrderByOrderIndexAsc(UUID userId, String status);

    List<Task> findByUserIdAndScheduledDateAndStatusOrderByOrderIndexAsc(
            UUID userId,
            LocalDate scheduledDate,
            String status
    );

    Optional<Task> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndGoalIdAndIsAiGeneratedTrue(UUID userId, UUID goalId);
}
