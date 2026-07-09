package com.studyflow.core.services;

import com.studyflow.core.dtos.tasks.CreateTaskRequest;
import com.studyflow.core.dtos.tasks.TaskResponse;
import com.studyflow.core.dtos.tasks.UpdateTaskRequest;
import com.studyflow.core.entities.LearningModule;
import com.studyflow.core.entities.Task;
import com.studyflow.core.exceptions.ResourceNotFoundException;
import com.studyflow.core.repositories.LearningModuleRepository;
import com.studyflow.core.repositories.TaskRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING", "IN_PROGRESS", "COMPLETED"
    );

    private final TaskRepository taskRepository;
    private final LearningModuleRepository learningModuleRepository;
    private final GoalService goalService;
    private final CurrentUserService currentUserService;

    public TaskService(
            TaskRepository taskRepository,
            LearningModuleRepository learningModuleRepository,
            GoalService goalService,
            CurrentUserService currentUserService
    ) {
        this.taskRepository = taskRepository;
        this.learningModuleRepository = learningModuleRepository;
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

        Task savedTask = taskRepository.saveAndFlush(task);
        return TaskResponse.from(savedTask);
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

        Set<UUID> moduleIds = tasks.stream()
                .map(Task::getModuleId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, String> moduleTitleMap = learningModuleRepository.findAllById(moduleIds).stream()
                .collect(Collectors.toMap(LearningModule::getId, LearningModule::getTitle));

        return tasks.stream()
                .map(task -> TaskResponse.from(task, moduleTitleMap.get(task.getModuleId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(UUID taskId, Authentication authentication) {
        Task task = findOwnedTask(taskId, authentication);
        String moduleTitle = findModuleTitle(task.getModuleId());
        return TaskResponse.from(task, moduleTitle);
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

        Task savedTask = taskRepository.saveAndFlush(task);
        String moduleTitle = findModuleTitle(savedTask.getModuleId());
        return TaskResponse.from(savedTask, moduleTitle);
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

    private String findModuleTitle(UUID moduleId) {
        if (moduleId == null) {
            return null;
        }
        return learningModuleRepository.findById(moduleId)
                .map(LearningModule::getTitle)
                .orElse(null);
    }
}
