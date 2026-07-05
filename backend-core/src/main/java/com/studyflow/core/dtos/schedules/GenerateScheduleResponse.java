package com.studyflow.core.dtos.schedules;

import com.studyflow.core.dtos.tasks.TaskResponse;

import java.util.List;
import java.util.UUID;

public record GenerateScheduleResponse(
        UUID goalId,
        UUID materialId,
        int moduleCount,
        int taskCount,
        List<TaskResponse> tasks
) {
}
