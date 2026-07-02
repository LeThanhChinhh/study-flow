package com.studyflow.core.controllers;

import com.studyflow.core.dtos.tasks.CreateTaskRequest;
import com.studyflow.core.dtos.tasks.TaskResponse;
import com.studyflow.core.dtos.tasks.UpdateTaskRequest;
import com.studyflow.core.services.TaskService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication
    ) {
        return taskService.createTask(request, authentication);
    }

    @GetMapping
    public List<TaskResponse> getTasks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String status,
            Authentication authentication
    ) {
        return taskService.getTasks(date, status, authentication);
    }

    @GetMapping("/{taskId}")
    public TaskResponse getTask(
            @PathVariable UUID taskId,
            Authentication authentication
    ) {
        return taskService.getTask(taskId, authentication);
    }

    @PutMapping("/{taskId}")
    public TaskResponse updateTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            Authentication authentication
    ) {
        return taskService.updateTask(taskId, request, authentication);
    }

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(
            @PathVariable UUID taskId,
            Authentication authentication
    ) {
        taskService.deleteTask(taskId, authentication);
    }
}
