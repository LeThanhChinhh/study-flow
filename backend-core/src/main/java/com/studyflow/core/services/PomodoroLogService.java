package com.studyflow.core.services;

import com.studyflow.core.dtos.pomodoro.PomodoroLogRequest;
import com.studyflow.core.dtos.pomodoro.PomodoroLogResponse;
import com.studyflow.core.entities.PomodoroLog;
import com.studyflow.core.entities.Task;
import com.studyflow.core.exceptions.ResourceNotFoundException;
import com.studyflow.core.repositories.PomodoroLogRepository;
import com.studyflow.core.repositories.TaskRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class PomodoroLogService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "IN_PROGRESS",
            "COMPLETED",
            "ABORTED"
    );

    private final PomodoroLogRepository pomodoroLogRepository;
    private final TaskRepository taskRepository;

    public PomodoroLogService(
            PomodoroLogRepository pomodoroLogRepository,
            TaskRepository taskRepository
    ) {
        this.pomodoroLogRepository = pomodoroLogRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional
    public PomodoroLogResponse createPomodoroLog(PomodoroLogRequest request) {
        validateRequest(request);

        UUID userId = getCurrentUserId();

        Task task = taskRepository.findByIdAndUserId(request.getTaskId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        Integer focusMinutes = request.getFocusMinutes();
        Integer breakMinutes = request.getBreakMinutes() == null ? 0 : request.getBreakMinutes();
        Integer pauseCount = request.getPauseCount() == null ? 0 : request.getPauseCount();
        String status = request.getStatus() == null ? "COMPLETED" : request.getStatus();

        OffsetDateTime startTime = request.getStartTime();
        OffsetDateTime endTime = request.getEndTime();

        if (startTime == null && endTime == null) {
            endTime = OffsetDateTime.now();
            startTime = endTime.minusMinutes(focusMinutes);
        } else if (startTime == null) {
            startTime = endTime.minusMinutes(focusMinutes);
        } else if (endTime == null) {
            endTime = startTime.plusMinutes(focusMinutes);
        }

        PomodoroLog log = new PomodoroLog();
        log.setTask(task);
        log.setStartTime(startTime);
        log.setEndTime(endTime);
        log.setFocusMinutes(focusMinutes);
        log.setBreakMinutes(breakMinutes);
        log.setPauseCount(pauseCount);
        log.setStatus(status);

        PomodoroLog savedLog = pomodoroLogRepository.saveAndFlush(log);

        return toResponse(savedLog);
    }

    @Transactional(readOnly = true)
    public List<PomodoroLogResponse> getCurrentUserLogs() {
        UUID userId = getCurrentUserId();

        return pomodoroLogRepository.findByTaskUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PomodoroLogResponse> getLogsByTask(UUID taskId) {
        UUID userId = getCurrentUserId();

        taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        return pomodoroLogRepository.findByTaskIdAndTaskUserId(taskId, userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void validateRequest(PomodoroLogRequest request) {
        if (request.getTaskId() == null) {
            throw new IllegalArgumentException("taskId is required");
        }

        if (request.getFocusMinutes() == null || request.getFocusMinutes() <= 0) {
            throw new IllegalArgumentException("focusMinutes must be greater than 0");
        }

        if (request.getBreakMinutes() != null && request.getBreakMinutes() < 0) {
            throw new IllegalArgumentException("breakMinutes must be greater than or equal to 0");
        }

        if (request.getPauseCount() != null && request.getPauseCount() < 0) {
            throw new IllegalArgumentException("pauseCount must be greater than or equal to 0");
        }

        if (request.getStatus() != null && !VALID_STATUSES.contains(request.getStatus())) {
            throw new IllegalArgumentException("Invalid pomodoro status");
        }
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Unauthenticated");
        }

        return UUID.fromString(authentication.getName());
    }

    private PomodoroLogResponse toResponse(PomodoroLog entity) {
        PomodoroLogResponse response = new PomodoroLogResponse();
        response.setId(entity.getId());
        response.setTaskId(entity.getTask().getId());
        response.setStartTime(entity.getStartTime());
        response.setEndTime(entity.getEndTime());
        response.setFocusMinutes(entity.getFocusMinutes());
        response.setBreakMinutes(entity.getBreakMinutes());
        response.setPauseCount(entity.getPauseCount());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
}