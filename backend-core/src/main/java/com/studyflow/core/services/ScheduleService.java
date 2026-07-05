package com.studyflow.core.services;

import com.studyflow.core.dtos.schedules.GenerateScheduleRequest;
import com.studyflow.core.dtos.schedules.GenerateScheduleResponse;
import com.studyflow.core.dtos.tasks.TaskResponse;
import com.studyflow.core.entities.Goal;
import com.studyflow.core.entities.LearningModule;
import com.studyflow.core.entities.Material;
import com.studyflow.core.entities.Task;
import com.studyflow.core.entities.TimeSlot;
import com.studyflow.core.exceptions.ResourceNotFoundException;
import com.studyflow.core.repositories.LearningModuleRepository;
import com.studyflow.core.repositories.MaterialRepository;
import com.studyflow.core.repositories.TaskRepository;
import com.studyflow.core.repositories.TimeSlotRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ScheduleService {

    private static final int DEFAULT_ESTIMATED_MINUTES = 25;
    private static final int MAX_TITLE_LENGTH = 255;

    private final MaterialRepository materialRepository;
    private final LearningModuleRepository learningModuleRepository;
    private final TaskRepository taskRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final GoalService goalService;
    private final CurrentUserService currentUserService;

    public ScheduleService(
            MaterialRepository materialRepository,
            LearningModuleRepository learningModuleRepository,
            TaskRepository taskRepository,
            TimeSlotRepository timeSlotRepository,
            GoalService goalService,
            CurrentUserService currentUserService
    ) {
        this.materialRepository = materialRepository;
        this.learningModuleRepository = learningModuleRepository;
        this.taskRepository = taskRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.goalService = goalService;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public GenerateScheduleResponse generateSchedule(
            GenerateScheduleRequest request,
            Authentication authentication
    ) {
        UUID userId = currentUserService.getCurrentUserId(authentication);
        Goal goal = goalService.findOwnedGoal(request.goalId(), authentication);
        Material material = findOwnedCompletedMaterial(request.materialId(), userId);

        validateMaterialGoalCompatibility(material, goal.getId());

        List<ParsedModule> parsedModules = parseAiModules(material.getRawJson());
        List<TimeSlot> timeSlots = timeSlotRepository.findByUserIdOrderByDayOfWeekAscStartTimeAsc(userId);
        List<AvailabilityWindow> availabilityWindows = buildAvailabilityWindows(goal, timeSlots);

        int taskOrderIndex = 0;
        List<Task> generatedTasks = new ArrayList<>();

        for (int moduleIndex = 0; moduleIndex < parsedModules.size(); moduleIndex++) {
            ParsedModule parsedModule = parsedModules.get(moduleIndex);

            LearningModule module = new LearningModule();
            module.setGoalId(goal.getId());
            module.setTitle(limitTitle(parsedModule.title(), "Module " + (moduleIndex + 1)));
            module.setOrderIndex(parsedModule.orderIndex() != null ? parsedModule.orderIndex() : moduleIndex + 1);
            LearningModule savedModule = learningModuleRepository.saveAndFlush(module);

            for (ParsedTask parsedTask : parsedModule.tasks()) {
                ScheduledRange scheduledRange = allocateNextRange(availabilityWindows, parsedTask.estimatedMinutes());

                Task task = new Task();
                task.setUserId(userId);
                task.setGoalId(goal.getId());
                task.setModuleId(savedModule.getId());
                task.setTitle(limitTitle(parsedTask.title(), "Generated task"));
                task.setScheduledDate(scheduledRange.date());
                task.setStartTime(scheduledRange.startTime());
                task.setEndTime(scheduledRange.endTime());
                task.setStatus("PENDING");
                task.setIsAiGenerated(true);
                task.setOrderIndex(taskOrderIndex++);

                generatedTasks.add(task);
            }
        }

        if (generatedTasks.isEmpty()) {
            throw new IllegalArgumentException("Parsed material contains no schedulable tasks");
        }

        List<Task> savedTasks = taskRepository.saveAllAndFlush(generatedTasks);

        if (material.getGoalId() == null) {
            material.setGoalId(goal.getId());
            materialRepository.saveAndFlush(material);
        }

        return new GenerateScheduleResponse(
                goal.getId(),
                material.getId(),
                parsedModules.size(),
                savedTasks.size(),
                savedTasks.stream().map(TaskResponse::from).toList()
        );
    }

    private Material findOwnedCompletedMaterial(UUID materialId, UUID userId) {
        Material material = materialRepository.findByIdAndUserId(materialId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

        if (!"COMPLETED".equals(material.getStatus())) {
            throw new IllegalArgumentException("Material parsing is not completed yet");
        }

        if (material.getRawJson() == null || material.getRawJson().isEmpty()) {
            throw new IllegalArgumentException("Material has no parsed AI data");
        }

        return material;
    }

    private void validateMaterialGoalCompatibility(Material material, UUID goalId) {
        if (material.getGoalId() != null && !material.getGoalId().equals(goalId)) {
            throw new IllegalArgumentException("Material does not belong to this goal");
        }
    }

    private List<ParsedModule> parseAiModules(Map<String, Object> rawJson) {
        Object modulesObject = rawJson.get("modules");
        if (!(modulesObject instanceof List<?> moduleObjects) || moduleObjects.isEmpty()) {
            throw new IllegalArgumentException("Parsed material contains no modules");
        }

        List<ParsedModule> parsedModules = new ArrayList<>();

        for (int moduleIndex = 0; moduleIndex < moduleObjects.size(); moduleIndex++) {
            Object moduleObject = moduleObjects.get(moduleIndex);
            if (!(moduleObject instanceof Map<?, ?> moduleMap)) {
                throw new IllegalArgumentException("Invalid module format in parsed material");
            }

            String moduleTitle = readString(moduleMap.get("title"), "Module " + (moduleIndex + 1));
            Integer moduleOrderIndex = readInteger(moduleMap.get("orderIndex"), moduleIndex + 1);
            Object tasksObject = moduleMap.get("tasks");

            if (!(tasksObject instanceof List<?> taskObjects) || taskObjects.isEmpty()) {
                throw new IllegalArgumentException("Module must contain at least one task");
            }

            List<ParsedTask> parsedTasks = new ArrayList<>();
            for (Object taskObject : taskObjects) {
                if (!(taskObject instanceof Map<?, ?> taskMap)) {
                    throw new IllegalArgumentException("Invalid task format in parsed material");
                }

                String taskTitle = readString(taskMap.get("title"), null);
                if (!StringUtils.hasText(taskTitle)) {
                    throw new IllegalArgumentException("Task title is required in parsed material");
                }

                int estimatedMinutes = readInteger(taskMap.get("estimatedMinutes"), DEFAULT_ESTIMATED_MINUTES);
                if (estimatedMinutes <= 0) {
                    throw new IllegalArgumentException("Task estimated minutes must be greater than 0");
                }

                parsedTasks.add(new ParsedTask(taskTitle, estimatedMinutes));
            }

            parsedModules.add(new ParsedModule(moduleTitle, moduleOrderIndex, parsedTasks));
        }

        return parsedModules;
    }

    private List<AvailabilityWindow> buildAvailabilityWindows(Goal goal, List<TimeSlot> timeSlots) {
        if (timeSlots.isEmpty()) {
            throw new IllegalArgumentException("At least one time slot is required before generating schedule");
        }

        List<AvailabilityWindow> windows = new ArrayList<>();
        LocalDate currentDate = goal.getStartDate();

        while (!currentDate.isAfter(goal.getDeadline())) {
            int dayOfWeek = currentDate.getDayOfWeek().getValue();
            for (TimeSlot timeSlot : timeSlots) {
                if (dayOfWeek == timeSlot.getDayOfWeek()) {
                    windows.add(new AvailabilityWindow(
                            currentDate,
                            timeSlot.getStartTime(),
                            timeSlot.getEndTime(),
                            timeSlot.getStartTime()
                    ));
                }
            }
            currentDate = currentDate.plusDays(1);
        }

        windows.sort(Comparator
                .comparing(AvailabilityWindow::date)
                .thenComparing(AvailabilityWindow::startTime));

        if (windows.isEmpty()) {
            throw new IllegalArgumentException("No available time slots found within goal date range");
        }

        return windows;
    }

    private ScheduledRange allocateNextRange(List<AvailabilityWindow> windows, int estimatedMinutes) {
        for (AvailabilityWindow window : windows) {
            LocalTime candidateEndTime = window.cursor().plusMinutes(estimatedMinutes);
            if (!candidateEndTime.isAfter(window.endTime())) {
                ScheduledRange range = new ScheduledRange(window.date(), window.cursor(), candidateEndTime);
                window.moveCursor(candidateEndTime);
                return range;
            }
        }

        throw new IllegalArgumentException("Not enough available time slots to generate schedule");
    }

    private String readString(Object value, String defaultValue) {
        if (value instanceof String stringValue && StringUtils.hasText(stringValue)) {
            return stringValue.trim();
        }
        return defaultValue;
    }

    private Integer readInteger(Object value, Integer defaultValue) {
        if (value instanceof Number numberValue) {
            return numberValue.intValue();
        }

        if (value instanceof String stringValue && StringUtils.hasText(stringValue)) {
            try {
                return Integer.parseInt(stringValue.trim());
            } catch (NumberFormatException ignored) {
                return defaultValue;
            }
        }

        return defaultValue;
    }

    private String limitTitle(String value, String fallback) {
        String title = StringUtils.hasText(value) ? value.trim() : fallback;
        if (title.length() <= MAX_TITLE_LENGTH) {
            return title;
        }
        return title.substring(0, MAX_TITLE_LENGTH);
    }

    private record ParsedModule(String title, Integer orderIndex, List<ParsedTask> tasks) {
    }

    private record ParsedTask(String title, int estimatedMinutes) {
    }

    private record ScheduledRange(LocalDate date, LocalTime startTime, LocalTime endTime) {
    }

    private static final class AvailabilityWindow {
        private final LocalDate date;
        private final LocalTime startTime;
        private final LocalTime endTime;
        private LocalTime cursor;

        private AvailabilityWindow(LocalDate date, LocalTime startTime, LocalTime endTime, LocalTime cursor) {
            this.date = date;
            this.startTime = startTime;
            this.endTime = endTime;
            this.cursor = cursor;
        }

        private LocalDate date() {
            return date;
        }

        private LocalTime startTime() {
            return startTime;
        }

        private LocalTime endTime() {
            return endTime;
        }

        private LocalTime cursor() {
            return cursor;
        }

        private void moveCursor(LocalTime cursor) {
            this.cursor = cursor;
        }
    }
}
