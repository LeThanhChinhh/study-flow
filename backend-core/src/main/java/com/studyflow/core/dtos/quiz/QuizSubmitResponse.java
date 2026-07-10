package com.studyflow.core.dtos.quiz;

import java.util.List;

public record QuizSubmitResponse(
    Integer totalQuestions,
    Integer correctAnswers,
    Integer scorePercent,
    Boolean taskCompleted,
    List<QuestionResultDto> results
) {}