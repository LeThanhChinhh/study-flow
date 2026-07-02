package com.studyflow.core.services;

import com.studyflow.core.dtos.goals.CreateGoalRequest;
import com.studyflow.core.dtos.goals.GoalResponse;
import com.studyflow.core.dtos.goals.UpdateGoalRequest;
import com.studyflow.core.entities.Goal;
import com.studyflow.core.exceptions.ResourceNotFoundException;
import com.studyflow.core.repositories.GoalRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class GoalService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "IN_PROGRESS", "COMPLETED", "ABANDONED"
    );

    private final GoalRepository goalRepository;
    private final CurrentUserService currentUserService;

    public GoalService(GoalRepository goalRepository, CurrentUserService currentUserService) {
        this.goalRepository = goalRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public GoalResponse createGoal(CreateGoalRequest request, Authentication authentication) {
        UUID userId = currentUserService.getCurrentUserId(authentication);
        validateDateRange(request.startDate(), request.deadline());

        Goal goal = new Goal();
        goal.setUserId(userId);
        goal.setTitle(request.title().trim());
        goal.setStartDate(request.startDate());
        goal.setDeadline(request.deadline());
        goal.setStatus("IN_PROGRESS");

        Goal savedGoal = goalRepository.saveAndFlush(goal);
        return GoalResponse.from(savedGoal);
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> getGoals(Authentication authentication) {
        UUID userId = currentUserService.getCurrentUserId(authentication);
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(GoalResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public GoalResponse getGoal(UUID goalId, Authentication authentication) {
        Goal goal = findOwnedGoal(goalId, authentication);
        return GoalResponse.from(goal);
    }

    @Transactional
    public GoalResponse updateGoal(UUID goalId, UpdateGoalRequest request, Authentication authentication) {
        Goal goal = findOwnedGoal(goalId, authentication);

        if (request.title() != null) {
            if (request.title().isBlank()) {
                throw new IllegalArgumentException("Title must not be empty");
            }
            goal.setTitle(request.title().trim());
        }

        LocalDate startDate = request.startDate() != null ? request.startDate() : goal.getStartDate();
        LocalDate deadline = request.deadline() != null ? request.deadline() : goal.getDeadline();
        validateDateRange(startDate, deadline);

        if (request.startDate() != null) {
            goal.setStartDate(request.startDate());
        }
        if (request.deadline() != null) {
            goal.setDeadline(request.deadline());
        }

        if (request.status() != null) {
            validateGoalStatus(request.status());
            goal.setStatus(request.status());
        }

        Goal savedGoal = goalRepository.saveAndFlush(goal);
        return GoalResponse.from(savedGoal);
    }

    @Transactional
    public void deleteGoal(UUID goalId, Authentication authentication) {
        Goal goal = findOwnedGoal(goalId, authentication);
        goalRepository.delete(goal);
    }

    Goal findOwnedGoal(UUID goalId, Authentication authentication) {
        UUID userId = currentUserService.getCurrentUserId(authentication);
        return goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
    }

    private void validateDateRange(LocalDate startDate, LocalDate deadline) {
        if (startDate.isAfter(deadline)) {
            throw new IllegalArgumentException("Start date must be on or before deadline");
        }
    }

    private void validateGoalStatus(String status) {
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Status must be IN_PROGRESS, COMPLETED, or ABANDONED");
        }
    }
}
