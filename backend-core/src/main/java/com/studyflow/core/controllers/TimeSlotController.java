package com.studyflow.core.controllers;

import com.studyflow.core.dtos.timeslots.CreateTimeSlotRequest;
import com.studyflow.core.dtos.timeslots.TimeSlotResponse;
import com.studyflow.core.dtos.timeslots.UpdateTimeSlotRequest;
import com.studyflow.core.services.TimeSlotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/time-slots")
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    public TimeSlotController(TimeSlotService timeSlotService) {
        this.timeSlotService = timeSlotService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TimeSlotResponse createTimeSlot(
            @Valid @RequestBody CreateTimeSlotRequest request,
            Authentication authentication
    ) {
        return timeSlotService.createTimeSlot(request, authentication);
    }

    @GetMapping
    public List<TimeSlotResponse> getTimeSlots(Authentication authentication) {
        return timeSlotService.getTimeSlots(authentication);
    }

    @PutMapping("/{timeSlotId}")
    public TimeSlotResponse updateTimeSlot(
            @PathVariable UUID timeSlotId,
            @Valid @RequestBody UpdateTimeSlotRequest request,
            Authentication authentication
    ) {
        return timeSlotService.updateTimeSlot(timeSlotId, request, authentication);
    }

    @DeleteMapping("/{timeSlotId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTimeSlot(
            @PathVariable UUID timeSlotId,
            Authentication authentication
    ) {
        timeSlotService.deleteTimeSlot(timeSlotId, authentication);
    }
}
