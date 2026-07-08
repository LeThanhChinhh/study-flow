package com.studyflow.core.services;

import com.studyflow.core.dtos.materials.MaterialStatusResponse;
import com.studyflow.core.dtos.materials.MaterialUploadResponse;
import com.studyflow.core.entities.Material;
import com.studyflow.core.exceptions.InvalidAiPlanningResultException;
import com.studyflow.core.exceptions.ResourceNotFoundException;
import com.studyflow.core.repositories.MaterialRepository;
import com.studyflow.core.services.ai.PlanningAiResultNormalizer;
import com.studyflow.core.services.ai.PlanningAiResultNormalizer.PlanningAiResult;
import com.studyflow.core.services.ai.planning.PlanningAiClient;
import com.studyflow.core.services.ai.planning.PlanningAiRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Service
public class MaterialService {

    private static final long MAX_FILE_SIZE_BYTES = 50L * 1024 * 1024;
    private static final String PDF_CONTENT_TYPE = "application/pdf";

    private final MaterialRepository materialRepository;
    private final GoalService goalService;
    private final CurrentUserService currentUserService;
    private final PlanningAiResultNormalizer planningAiResultNormalizer;
    private final PlanningAiClient planningAiClient;

    public MaterialService(
            MaterialRepository materialRepository,
            GoalService goalService,
            CurrentUserService currentUserService,
            PlanningAiResultNormalizer planningAiResultNormalizer,
            PlanningAiClient planningAiClient
    ) {
        this.materialRepository = materialRepository;
        this.goalService = goalService;
        this.currentUserService = currentUserService;
        this.planningAiResultNormalizer = planningAiResultNormalizer;
        this.planningAiClient = planningAiClient;
    }

    @Transactional
    public MaterialUploadResponse uploadMaterial(
            MultipartFile file,
            UUID goalId,
            Authentication authentication
    ) {
        UUID userId = currentUserService.getCurrentUserId(authentication);

        if (goalId != null) {
            goalService.findOwnedGoal(goalId, authentication);
        }

        validatePdfFile(file);

        String fileName = normalizeFileName(file.getOriginalFilename());
        String jobId = UUID.randomUUID().toString();

        Material material = new Material();
        material.setUserId(userId);
        material.setGoalId(goalId);
        material.setFileName(fileName);
        material.setFileUrl("mock://materials/" + jobId + "/" + fileName);
        material.setJobId(jobId);
        material.setStatus("PROCESSING");

        Material savedMaterial = materialRepository.saveAndFlush(material);

        try {
            PlanningAiRequest request = new PlanningAiRequest(fileName, file.getContentType(), file.getBytes());
            Map<String, Object> rawAiResult = planningAiClient.generatePlanning(request);
            PlanningAiResult normalizedResult = planningAiResultNormalizer.normalize(rawAiResult);
            savedMaterial.setRawJson(normalizedResult.normalizedRawJson());
            savedMaterial.setStatus("COMPLETED");
        } catch (InvalidAiPlanningResultException | java.io.IOException e) {
            savedMaterial.setRawJson(null);
            savedMaterial.setStatus("FAILED");
        }
        materialRepository.saveAndFlush(savedMaterial);

        return new MaterialUploadResponse(
                jobId,
                "PROCESSING",
                "AI is analyzing the document."
        );
    }

    @Transactional(readOnly = true)
    public MaterialStatusResponse getMaterialStatus(String jobId, Authentication authentication) {
        UUID userId = currentUserService.getCurrentUserId(authentication);

        Material material = materialRepository.findByJobIdAndUserId(jobId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Material job not found"));

        return MaterialStatusResponse.from(material);
    }

    private void validatePdfFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("PDF file is required");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("PDF file must not exceed 50MB");
        }

        String fileName = normalizeFileName(file.getOriginalFilename());
        String contentType = file.getContentType();
        boolean hasPdfContentType = PDF_CONTENT_TYPE.equalsIgnoreCase(contentType);
        boolean hasPdfExtension = fileName.toLowerCase().endsWith(".pdf");

        if (!hasPdfContentType && !hasPdfExtension) {
            throw new IllegalArgumentException("Only PDF files are supported");
        }
    }

    private String normalizeFileName(String originalFileName) {
        String cleanedFileName = StringUtils.hasText(originalFileName)
                ? StringUtils.cleanPath(originalFileName.trim())
                : "material.pdf";

        cleanedFileName = cleanedFileName.replace('\\', '/');
        if (cleanedFileName.contains("..")) {
            throw new IllegalArgumentException("Invalid file name");
        }

        int lastSlashIndex = cleanedFileName.lastIndexOf('/');
        if (lastSlashIndex >= 0) {
            cleanedFileName = cleanedFileName.substring(lastSlashIndex + 1);
        }

        if (!StringUtils.hasText(cleanedFileName)) {
            cleanedFileName = "material.pdf";
        }

        if (cleanedFileName.length() > 255) {
            throw new IllegalArgumentException("File name must not exceed 255 characters");
        }

        return cleanedFileName;
    }


}
