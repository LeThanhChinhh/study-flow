package com.studyflow.core.dtos.quiz;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record QuizSubmitRequest(
    @Valid
    @NotEmpty(message = "Danh sách answers không được để trống")
    List<AnswerDTO> answers,

    Boolean completeTaskAfterSubmit
) {
    public record AnswerDTO(
        @NotNull(message = "quizId là bắt buộc")
        UUID quizId,

        @NotNull(message = "selectedOptionId là bắt buộc")
        UUID selectedOptionId
    ) {}
}