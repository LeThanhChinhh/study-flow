package com.studyflow.core.dtos.quiz;

public record QuizSubmitResponse(
    Integer totalQuestions,
    Integer correctAnswers,
    Integer scorePercent,
    Boolean taskCompleted
) {}