package com.studyflow.core.dtos.quiz;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record QuizReviewResponse(
        UUID taskId,
        String taskTitle,
        int totalQuestions,
        int correctAnswers,
        int scorePercent,
        OffsetDateTime answeredAt,
        List<QuestionResultDto> results
) {
}
