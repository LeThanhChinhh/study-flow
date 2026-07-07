package com.studyflow.core.services;

import com.studyflow.core.dtos.schedules.GenerateScheduleRequest;
import com.studyflow.core.dtos.schedules.GenerateScheduleResponse;
import com.studyflow.core.dtos.tasks.TaskResponse;
import com.studyflow.core.entities.Goal;
import com.studyflow.core.entities.LearningModule;
import com.studyflow.core.entities.Material;
import com.studyflow.core.entities.Task;
import com.studyflow.core.entities.TimeSlot;
import com.studyflow.core.exceptions.ConflictException;
import com.studyflow.core.exceptions.ResourceNotFoundException;
import com.studyflow.core.repositories.LearningModuleRepository;
import com.studyflow.core.repositories.MaterialRepository;
import com.studyflow.core.repositories.TaskRepository;
import com.studyflow.core.repositories.TimeSlotRepository;
import com.studyflow.core.services.ai.PlanningAiResultNormalizer;
import com.studyflow.core.services.ai.PlanningAiResultNormalizer.PlanningAiResult;
import com.studyflow.core.services.ai.PlanningAiResultNormalizer.PlanningModule;
import com.studyflow.core.services.ai.PlanningAiResultNormalizer.PlanningTask;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class ScheduleService {

    private final MaterialRepository materialRepository;
    private final LearningModuleRepository learningModuleRepository;
    private final TaskRepository taskRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final GoalService goalService;
    private final CurrentUserService currentUserService;
    private final PlanningAiResultNormalizer planningAiResultNormalizer;

    public ScheduleService(
            MaterialRepository materialRepository,
            LearningModuleRepository learningModuleRepository,
            TaskRepository taskRepository,
            TimeSlotRepository timeSlotRepository,
            GoalService goalService,
            CurrentUserService currentUserService,
            PlanningAiResultNormalizer planningAiResultNormalizer
    ) {
        this.materialRepository = materialRepository;
        this.learningModuleRepository = learningModuleRepository;
        this.taskRepository = taskRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.goalService = goalService;
        this.currentUserService = currentUserService;
        this.planningAiResultNormalizer = planningAiResultNormalizer;
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

        if (taskRepository.existsByUserIdAndGoalIdAndIsAiGeneratedTrue(userId, goal.getId())) {
            throw new ConflictException("Schedule has already been generated for this goal.");
        }

        PlanningAiResult planningResult = planningAiResultNormalizer.normalize(material.getRawJson());
        List<PlanningModule> parsedModules = planningResult.modules();
        
        List<TimeSlot> timeSlots = timeSlotRepository.findByUserIdOrderByDayOfWeekAscStartTimeAsc(userId);
        List<AvailabilityWindow> availabilityWindows = buildAvailabilityWindows(goal, timeSlots);

        int taskOrderIndex = 0;
        List<Task> generatedTasks = new ArrayList<>();

        for (PlanningModule parsedModule : parsedModules) {
            LearningModule module = new LearningModule();
            module.setGoalId(goal.getId());
            module.setTitle(parsedModule.title());
            module.setOrderIndex(parsedModule.orderIndex());
            LearningModule savedModule = learningModuleRepository.saveAndFlush(module);

            for (PlanningTask parsedTask : parsedModule.tasks()) {
                ScheduledRange scheduledRange = allocateNextRange(availabilityWindows, parsedTask.estimatedMinutes());

                Task task = new Task();
                task.setUserId(userId);
                task.setGoalId(goal.getId());
                task.setModuleId(savedModule.getId());
                task.setTitle(parsedTask.title());
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
            throw new ConflictException("Material parsing is not completed yet");
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
