package com.studyflow.core.dtos.quiz;

import java.util.List;
import java.util.UUID;

public record QuestionResultDto(
    UUID quizId,
    String questionText,
    UUID selectedOptionId,
    UUID correctOptionId,
    Boolean isCorrect,
    List<QuizOptionResponse> options
) {}
