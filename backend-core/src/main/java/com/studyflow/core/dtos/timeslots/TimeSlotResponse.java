package com.studyflow.core.dtos.timeslots;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.studyflow.core.entities.TimeSlot;

import java.time.LocalTime;
import java.util.UUID;

public record TimeSlotResponse(
        UUID id,
        Integer dayOfWeek,
        @JsonFormat(pattern = "HH:mm")
        LocalTime startTime,
        @JsonFormat(pattern = "HH:mm")
        LocalTime endTime
) {
    public static TimeSlotResponse from(TimeSlot timeSlot) {
        return new TimeSlotResponse(
                timeSlot.getId(),
                timeSlot.getDayOfWeek(),
                timeSlot.getStartTime(),
                timeSlot.getEndTime()
        );
    }
}
