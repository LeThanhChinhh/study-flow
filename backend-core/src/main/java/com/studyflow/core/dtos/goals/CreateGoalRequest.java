package com.studyflow.core.dtos.goals;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateGoalRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "Deadline is required")
        LocalDate deadline
) {
}
