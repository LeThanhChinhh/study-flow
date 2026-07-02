package com.studyflow.core.dtos.quiz;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record QuizGenerateRequest(
    @NotNull(message = "taskId là bắt buộc")
    UUID taskId
) {}