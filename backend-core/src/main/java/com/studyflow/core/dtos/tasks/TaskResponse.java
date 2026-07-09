package com.studyflow.core.dtos.tasks;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.studyflow.core.entities.Task;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID goalId,
        UUID moduleId,
        String moduleTitle,
        String title,
        LocalDate scheduledDate,
        @JsonFormat(pattern = "HH:mm")
        LocalTime startTime,
        @JsonFormat(pattern = "HH:mm")
        LocalTime endTime,
        String status,
        Boolean isAiGenerated,
        Integer orderIndex,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static TaskResponse from(Task task) {
        return from(task, null);
    }

    public static TaskResponse from(Task task, String moduleTitle) {
        return new TaskResponse(
                task.getId(),
                task.getGoalId(),
                task.getModuleId(),
                moduleTitle,
                task.getTitle(),
                task.getScheduledDate(),
                task.getStartTime(),
                task.getEndTime(),
                task.getStatus(),
                task.getIsAiGenerated(),
                task.getOrderIndex(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
