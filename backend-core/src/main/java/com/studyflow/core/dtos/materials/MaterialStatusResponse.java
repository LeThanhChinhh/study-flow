package com.studyflow.core.dtos.materials;

import com.studyflow.core.entities.Material;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record MaterialStatusResponse(
        UUID id,
        UUID goalId,
        String fileName,
        String fileUrl,
        String jobId,
        String status,
        Map<String, Object> rawJson,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static MaterialStatusResponse from(Material material) {
        return new MaterialStatusResponse(
                material.getId(),
                material.getGoalId(),
                material.getFileName(),
                material.getFileUrl(),
                material.getJobId(),
                material.getStatus(),
                material.getRawJson(),
                material.getCreatedAt(),
                material.getUpdatedAt()
        );
    }
}
