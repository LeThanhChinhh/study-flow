package com.studyflow.core.dtos.quiz;

import java.util.List;
import java.util.UUID;

public record QuizQuestionResponse(
    UUID questionId,
    String text,
    List<QuizOptionResponse> options
) {}