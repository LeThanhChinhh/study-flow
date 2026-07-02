package com.studyflow.core.dtos.tasks;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CreateTaskRequest(
        UUID goalId,

        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        LocalDate scheduledDate,

        @JsonFormat(pattern = "HH:mm")
        LocalTime startTime,

        @JsonFormat(pattern = "HH:mm")
        LocalTime endTime,

        Integer orderIndex
) {
}
