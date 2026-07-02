package com.studyflow.core.dtos.quiz;

public record QuizSubmitResponse(
    Integer totalQuestions,
    Integer correctAnswers,
    Integer score,
    Boolean completedTask
) {}