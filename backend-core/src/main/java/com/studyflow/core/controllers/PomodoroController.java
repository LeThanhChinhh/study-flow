package com.studyflow.core.controllers;

import com.studyflow.core.dtos.pomodoro.PomodoroLogRequest;
import com.studyflow.core.dtos.pomodoro.PomodoroLogResponse;
import com.studyflow.core.services.PomodoroLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
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
    public ResponseEntity<PomodoroLogResponse> createPomodoroLog(
            @Valid @RequestBody PomodoroLogRequest request
    ) {
        PomodoroLogResponse response = pomodoroLogService.createPomodoroLog(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/logs/by-task/{taskId}")
    public ResponseEntity<List<PomodoroLogResponse>> getLogsByTask(
            @PathVariable UUID taskId
    ) {
        List<PomodoroLogResponse> logs = pomodoroLogService.getLogsByTask(taskId);
        return ResponseEntity.ok(logs);
    }
}