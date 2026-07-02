package com.studyflow.core.controllers;

import com.studyflow.core.dtos.pomodoro.PomodoroLogRequest;
import com.studyflow.core.dtos.pomodoro.PomodoroLogResponse;
import com.studyflow.core.services.PomodoroLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pomodoro")
public class PomodoroController {

    private final PomodoroLogService pomodoroLogService;

    public PomodoroController(PomodoroLogService pomodoroLogService) {
        this.pomodoroLogService = pomodoroLogService;
    }

    @PostMapping("/log")
    @ResponseStatus(HttpStatus.CREATED)
    public PomodoroLogResponse createPomodoroLog(
            @Valid @RequestBody PomodoroLogRequest request
    ) {
        return pomodoroLogService.createPomodoroLog(request);
    }

    @GetMapping("/logs")
    public List<PomodoroLogResponse> getCurrentUserLogs() {
        return pomodoroLogService.getCurrentUserLogs();
    }

    @GetMapping("/logs/by-task/{taskId}")
    public List<PomodoroLogResponse> getLogsByTask(
            @PathVariable UUID taskId
    ) {
        return pomodoroLogService.getLogsByTask(taskId);
    }
}