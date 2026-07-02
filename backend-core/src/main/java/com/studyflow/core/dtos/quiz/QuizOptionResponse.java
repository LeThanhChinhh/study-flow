package com.studyflow.core.dtos.quiz;

import java.util.UUID;

public record QuizOptionResponse(
    UUID optionId,
    String optionText
) {}