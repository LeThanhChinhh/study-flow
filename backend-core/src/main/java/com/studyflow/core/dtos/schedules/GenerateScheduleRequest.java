package com.studyflow.core.dtos.schedules;

import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

public record GenerateScheduleRequest(
        @NotNull(message = "Goal id is required")
        UUID goalId,

        @NotNull(message = "Material id is required")
        UUID materialId,

        Map<String, Object> planningData
) {
}
