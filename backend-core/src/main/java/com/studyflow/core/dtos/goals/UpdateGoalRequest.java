package com.studyflow.core.dtos.goals;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateGoalRequest(

        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        LocalDate startDate,

        LocalDate deadline,

        String status
) {
}
