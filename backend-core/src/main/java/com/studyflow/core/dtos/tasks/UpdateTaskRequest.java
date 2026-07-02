package com.studyflow.core.dtos.tasks;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record UpdateTaskRequest(

        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        LocalDate scheduledDate,

        @JsonFormat(pattern = "HH:mm")
        LocalTime startTime,

        @JsonFormat(pattern = "HH:mm")
        LocalTime endTime,

        String status,

        Integer orderIndex
) {
}
