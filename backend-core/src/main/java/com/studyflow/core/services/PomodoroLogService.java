package com.studyflow.core.services;

import com.studyflow.core.dtos.pomodoro.PomodoroLogRequest;
import com.studyflow.core.dtos.pomodoro.PomodoroLogResponse;
import com.studyflow.core.entities.PomodoroLog;
import com.studyflow.core.entities.Task;
import com.studyflow.core.repositories.PomodoroLogRepository;
import com.studyflow.core.repositories.TaskRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PomodoroLogService {

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
        UUID userId = getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(request.getTaskId(), userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Task không tồn tại hoặc không thuộc user hiện tại")
                );

        validateRequest(request);

        OffsetDateTime startTime = request.getStartTime();
        OffsetDateTime endTime = request.getEndTime();
        Integer focusMinutes = request.getFocusMinutes();

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
        log.setStatus(request.getStatus());

        PomodoroLog savedLog = pomodoroLogRepository.save(log);
        return toResponse(savedLog);
    }

    @Transactional(readOnly = true)
    public List<PomodoroLogResponse> getLogsByTask(UUID taskId) {
        UUID userId = getCurrentUserId();

        taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Task không tồn tại hoặc không thuộc user hiện tại")
                );

        return pomodoroLogRepository.findByTaskIdAndTaskUserId(taskId, userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void validateRequest(PomodoroLogRequest request) {
        if (request.getFocusMinutes() == null || request.getFocusMinutes() <= 0) {
            throw new IllegalArgumentException("focusMinutes phải lớn hơn 0");
        }

        if (request.getTaskId() == null) {
            throw new IllegalArgumentException("taskId là bắt buộc");
        }
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User chưa xác thực");
        }

        String name = authentication.getName();
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("Cannot get userId from token");
        }

        return UUID.fromString(name);
    }

    private PomodoroLogResponse toResponse(PomodoroLog entity) {
        PomodoroLogResponse response = new PomodoroLogResponse();
        response.setId(entity.getId());
        response.setTaskId(entity.getTask().getId());
        response.setStartTime(entity.getStartTime());
        response.setEndTime(entity.getEndTime());
        response.setFocusMinutes(entity.getFocusMinutes());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
}