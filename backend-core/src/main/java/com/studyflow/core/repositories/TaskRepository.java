package com.studyflow.core.repositories;

import com.studyflow.core.entities.Task;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    /**
     * Find tasks for the same user on the same date that overlap with [newStart, newEnd),
     * excluding the task being updated itself.
     * Overlap condition: newStart < existingEnd AND newEnd > existingStart
     */
    @Query("SELECT t FROM Task t WHERE t.userId = :userId" +
           " AND t.scheduledDate = :date" +
           " AND t.id <> :excludeId" +
           " AND t.startTime IS NOT NULL AND t.endTime IS NOT NULL" +
           " AND :newStart < t.endTime AND :newEnd > t.startTime")
    List<Task> findOverlappingTasks(
            @Param("userId") UUID userId,
            @Param("date") LocalDate date,
            @Param("excludeId") UUID excludeId,
            @Param("newStart") LocalTime newStart,
            @Param("newEnd") LocalTime newEnd
    );

    /**
     * Find tasks for the same user on the same date that overlap with [newStart, newEnd),
     * for task creation (no excludeId).
     * Overlap condition: newStart < existingEnd AND newEnd > existingStart
     */
    @Query("SELECT t FROM Task t WHERE t.userId = :userId" +
           " AND t.scheduledDate = :date" +
           " AND t.startTime IS NOT NULL AND t.endTime IS NOT NULL" +
           " AND :newStart < t.endTime AND :newEnd > t.startTime")
    List<Task> findOverlappingTasksForCreate(
            @Param("userId") UUID userId,
            @Param("date") LocalDate date,
            @Param("newStart") LocalTime newStart,
            @Param("newEnd") LocalTime newEnd
    );
}
