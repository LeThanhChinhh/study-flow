package com.studyflow.core.dtos.quiz;

import java.util.UUID;

public record QuizOptionResponse(
    UUID id,
    String text
) {}