package com.studyflow.core.dtos.goals;

import com.studyflow.core.entities.Goal;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record GoalResponse(
        UUID id,
        String title,
        LocalDate startDate,
        LocalDate deadline,
        String status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static GoalResponse from(Goal goal) {
        return new GoalResponse(
                goal.getId(),
                goal.getTitle(),
                goal.getStartDate(),
                goal.getDeadline(),
                goal.getStatus(),
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }
}
