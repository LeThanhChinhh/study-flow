package com.studyflow.core.dtos.materials;

public record MaterialUploadResponse(
        String jobId,
        String status,
        String message
) {
}
