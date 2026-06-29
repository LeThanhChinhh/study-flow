package com.studyflow.core.services;

import com.studyflow.core.dtos.tasks.CreateTaskRequest;
import com.studyflow.core.dtos.tasks.TaskResponse;
import com.studyflow.core.dtos.tasks.UpdateTaskRequest;
import com.studyflow.core.entities.Task;
import com.studyflow.core.exceptions.ResourceNotFoundException;
import com.studyflow.core.repositories.TaskRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class TaskService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING", "IN_PROGRESS", "COMPLETED"
    );

    private final TaskRepository taskRepository;
    private final GoalService goalService;
    private final CurrentUserService currentUserService;

    public TaskService(
            TaskRepository taskRepository,
            GoalService goalService,
            CurrentUserService currentUserService
    ) {
        this.taskRepository = taskRepository;
        this.goalService = goalService;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request, Authentication authentication) {
        UUID userId = currentUserService.getCurrentUserId(authentication);

        if (request.goalId() != null) {
            goalService.findOwnedGoal(request.goalId(), authentication);
        }

        validateTimeRange(request.startTime(), request.endTime());

        Task task = new Task();
        task.setUserId(userId);
        task.setGoalId(request.goalId());
        task.setModuleId(null);
        task.setTitle(request.title().trim());
        task.setScheduledDate(request.scheduledDate());
        task.setStartTime(request.startTime());
        task.setEndTime(request.endTime());
        task.setStatus("PENDING");
        task.setIsAiGenerated(false);
        task.setOrderIndex(request.orderIndex() != null ? request.orderIndex() : 0);

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(
            LocalDate date,
            String status,
            Authentication authentication
    ) {
        UUID userId = currentUserService.getCurrentUserId(authentication);

        if (status != null) {
            validateTaskStatus(status);
        }

        List<Task> tasks;
        if (date != null && status != null) {
            tasks = taskRepository.findByUserIdAndScheduledDateAndStatusOrderByOrderIndexAsc(
                    userId, date, status
            );
        } else if (date != null) {
            tasks = taskRepository.findByUserIdAndScheduledDateOrderByOrderIndexAsc(userId, date);
        } else if (status != null) {
            tasks = taskRepository.findByUserIdAndStatusOrderByOrderIndexAsc(userId, status);
        } else {
            tasks = taskRepository.findByUserIdOrderByOrderIndexAscCreatedAtDesc(userId);
        }

        return tasks.stream().map(TaskResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(UUID taskId, Authentication authentication) {
        Task task = findOwnedTask(taskId, authentication);
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse updateTask(UUID taskId, UpdateTaskRequest request, Authentication authentication) {
        Task task = findOwnedTask(taskId, authentication);

        if (request.title() != null) {
            if (request.title().isBlank()) {
                throw new IllegalArgumentException("Title must not be empty");
            }
            task.setTitle(request.title().trim());
        }

        if (request.scheduledDate() != null) {
            task.setScheduledDate(request.scheduledDate());
        }

        LocalTime startTime = request.startTime() != null ? request.startTime() : task.getStartTime();
        LocalTime endTime = request.endTime() != null ? request.endTime() : task.getEndTime();
        if (startTime != null && endTime != null) {
            validateTimeRange(startTime, endTime);
        }

        if (request.startTime() != null) {
            task.setStartTime(request.startTime());
        }
        if (request.endTime() != null) {
            task.setEndTime(request.endTime());
        }

        if (request.status() != null) {
            validateTaskStatus(request.status());
            task.setStatus(request.status());
        }

        if (request.orderIndex() != null) {
            task.setOrderIndex(request.orderIndex());
        }

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(UUID taskId, Authentication authentication) {
        Task task = findOwnedTask(taskId, authentication);
        taskRepository.delete(task);
    }

    private Task findOwnedTask(UUID taskId, Authentication authentication) {
        UUID userId = currentUserService.getCurrentUserId(authentication);
        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime != null && endTime != null && !startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }

    private void validateTaskStatus(String status) {
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Status must be PENDING, IN_PROGRESS, or COMPLETED");
        }
    }
}
