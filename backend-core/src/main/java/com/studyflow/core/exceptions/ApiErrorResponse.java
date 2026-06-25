package com.studyflow.core.exceptions;

import java.time.OffsetDateTime;
import java.util.Map;

public record ApiErrorResponse(
        int status,
        String message,
        Map<String, String> errors,
        OffsetDateTime timestamp
) {
    public static ApiErrorResponse of(int status, String message) {
        return new ApiErrorResponse(
                status,
                message,
                null,
                OffsetDateTime.now()
        );
    }

    public static ApiErrorResponse of(int status, String message, Map<String, String> errors) {
        return new ApiErrorResponse(
                status,
                message,
                errors,
                OffsetDateTime.now()
        );
    }
}