package com.studyflow.core.controllers;

import com.studyflow.core.dtos.goals.CreateGoalRequest;
import com.studyflow.core.dtos.goals.GoalResponse;
import com.studyflow.core.dtos.goals.UpdateGoalRequest;
import com.studyflow.core.services.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GoalResponse createGoal(
            @Valid @RequestBody CreateGoalRequest request,
            Authentication authentication
    ) {
        return goalService.createGoal(request, authentication);
    }

    @GetMapping
    public List<GoalResponse> getGoals(Authentication authentication) {
        return goalService.getGoals(authentication);
    }

    @GetMapping("/{goalId}")
    public GoalResponse getGoal(
            @PathVariable UUID goalId,
            Authentication authentication
    ) {
        return goalService.getGoal(goalId, authentication);
    }

    @PutMapping("/{goalId}")
    public GoalResponse updateGoal(
            @PathVariable UUID goalId,
            @Valid @RequestBody UpdateGoalRequest request,
            Authentication authentication
    ) {
        return goalService.updateGoal(goalId, request, authentication);
    }

    @DeleteMapping("/{goalId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGoal(
            @PathVariable UUID goalId,
            Authentication authentication
    ) {
        goalService.deleteGoal(goalId, authentication);
    }
}
