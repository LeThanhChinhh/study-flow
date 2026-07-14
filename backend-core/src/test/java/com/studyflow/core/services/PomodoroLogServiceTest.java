package com.studyflow.core.services;

import com.studyflow.core.dtos.pomodoro.PomodoroLogRequest;
import com.studyflow.core.dtos.pomodoro.PomodoroLogResponse;
import com.studyflow.core.entities.PomodoroLog;
import com.studyflow.core.entities.Task;
import com.studyflow.core.exceptions.ConflictException;
import com.studyflow.core.repositories.PomodoroLogRepository;
import com.studyflow.core.repositories.TaskRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PomodoroLogServiceTest {

    @Mock
    private PomodoroLogRepository pomodoroLogRepository;

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private PomodoroLogService pomodoroLogService;

    private UUID userId;

    @BeforeEach
    void setUpAuthentication() {
        userId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of())
        );
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createPomodoroLogRejectsFocusMinutesAboveConfiguredMaximum() {
        PomodoroLogRequest request = request(
                UUID.randomUUID(),
                UUID.randomUUID(),
                91,
                0,
                0,
                "COMPLETED"
        );

        assertThatThrownBy(() -> pomodoroLogService.createPomodoroLog(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("focusMinutes must not exceed 90");
    }

    @Test
    void createPomodoroLogRejectsEndTimeBeforeStartTime() {
        UUID taskId = UUID.randomUUID();
        Task task = task(taskId, userId);
        PomodoroLogRequest request = request(taskId, UUID.randomUUID(), 25, 0, 0, "COMPLETED");
        request.setStartTime(OffsetDateTime.now());
        request.setEndTime(OffsetDateTime.now().minusMinutes(1));

        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> pomodoroLogService.createPomodoroLog(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("endTime must not be before startTime");
    }

    @Test
    void createPomodoroLogUsesClientSessionIdForIdempotency() {
        UUID taskId = UUID.randomUUID();
        UUID clientSessionId = UUID.randomUUID();
        Task task = task(taskId, userId);
        PomodoroLog storedLog = storedLog(task, clientSessionId, 25, 5, 1, "COMPLETED");

        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task));
        when(pomodoroLogRepository.insertIfNotExists(any(PomodoroLog.class))).thenReturn(1);
        when(pomodoroLogRepository.findByTaskIdAndClientSessionId(taskId, clientSessionId))
                .thenReturn(Optional.of(storedLog));

        PomodoroLogResponse response = pomodoroLogService.createPomodoroLog(
                request(taskId, clientSessionId, 25, 5, 1, "COMPLETED")
        );

        assertThat(response.getId()).isEqualTo(storedLog.getId());
        assertThat(response.getClientSessionId()).isEqualTo(clientSessionId);
        assertThat(response.getFocusMinutes()).isEqualTo(25);

        ArgumentCaptor<PomodoroLog> captor = ArgumentCaptor.forClass(PomodoroLog.class);
        verify(pomodoroLogRepository).insertIfNotExists(captor.capture());
        assertThat(captor.getValue().getTask().getId()).isEqualTo(taskId);
        assertThat(captor.getValue().getClientSessionId()).isEqualTo(clientSessionId);
    }

    @Test
    void createPomodoroLogRejectsRetryWithDifferentPayload() {
        UUID taskId = UUID.randomUUID();
        UUID clientSessionId = UUID.randomUUID();
        Task task = task(taskId, userId);
        PomodoroLog existingLog = storedLog(task, clientSessionId, 25, 0, 0, "COMPLETED");

        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task));
        when(pomodoroLogRepository.findByTaskIdAndClientSessionId(taskId, clientSessionId))
                .thenReturn(Optional.of(existingLog));

        assertThatThrownBy(() -> pomodoroLogService.createPomodoroLog(
                request(taskId, clientSessionId, 20, 0, 0, "COMPLETED")
        ))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("payload mismatch");
    }

    private static PomodoroLogRequest request(
            UUID taskId,
            UUID clientSessionId,
            int focusMinutes,
            int breakMinutes,
            int pauseCount,
            String status
    ) {
        PomodoroLogRequest request = new PomodoroLogRequest();
        request.setTaskId(taskId);
        request.setClientSessionId(clientSessionId);
        request.setFocusMinutes(focusMinutes);
        request.setBreakMinutes(breakMinutes);
        request.setPauseCount(pauseCount);
        request.setStatus(status);
        return request;
    }

    private static Task task(UUID taskId, UUID ownerId) {
        Task task = new Task();
        task.setId(taskId);
        task.setUserId(ownerId);
        task.setTitle("Study graph traversal");
        return task;
    }

    private static PomodoroLog storedLog(
            Task task,
            UUID clientSessionId,
            int focusMinutes,
            int breakMinutes,
            int pauseCount,
            String status
    ) {
        PomodoroLog log = new PomodoroLog();
        log.setId(UUID.randomUUID());
        log.setTask(task);
        log.setClientSessionId(clientSessionId);
        log.setFocusMinutes(focusMinutes);
        log.setBreakMinutes(breakMinutes);
        log.setPauseCount(pauseCount);
        log.setStatus(status);
        log.setStartTime(OffsetDateTime.now().minusMinutes(focusMinutes));
        log.setEndTime(OffsetDateTime.now());
        return log;
    }
}
