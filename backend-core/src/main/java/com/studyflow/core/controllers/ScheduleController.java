package com.studyflow.core.controllers;

import com.studyflow.core.dtos.schedules.GenerateScheduleRequest;
import com.studyflow.core.dtos.schedules.GenerateScheduleResponse;
import com.studyflow.core.services.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    public GenerateScheduleResponse generateSchedule(
            @Valid @RequestBody GenerateScheduleRequest request,
            Authentication authentication
    ) {
        return scheduleService.generateSchedule(request, authentication);
    }
}
