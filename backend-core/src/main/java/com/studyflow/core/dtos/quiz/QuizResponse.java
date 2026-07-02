package com.studyflow.core.dtos.quiz;

import java.util.List;
import java.util.UUID;

public record QuizResponse(
    UUID id,
    UUID taskId,
    String questionText,
    List<QuizOptionResponse> options
) {}