package com.studyflow.core.services;

import com.studyflow.core.entities.Material;
import com.studyflow.core.exceptions.InvalidAiPlanningResultException;
import com.studyflow.core.repositories.MaterialRepository;
import com.studyflow.core.services.ai.PlanningAiResultNormalizer;
import com.studyflow.core.services.ai.PlanningAiResultNormalizer.PlanningAiResult;
import com.studyflow.core.services.ai.planning.PlanningAiClient;
import com.studyflow.core.services.ai.planning.PlanningAiRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class MaterialAiProcessingService {

    private static final Logger log = LoggerFactory.getLogger(MaterialAiProcessingService.class);

    private final MaterialRepository materialRepository;
    private final PlanningAiClient planningAiClient;
    private final PlanningAiResultNormalizer planningAiResultNormalizer;

    public MaterialAiProcessingService(
            MaterialRepository materialRepository,
            PlanningAiClient planningAiClient,
            PlanningAiResultNormalizer planningAiResultNormalizer
    ) {
        this.materialRepository = materialRepository;
        this.planningAiClient = planningAiClient;
        this.planningAiResultNormalizer = planningAiResultNormalizer;
    }

    @Async
    @Transactional
    public void processMaterialAsync(UUID materialId, PlanningAiRequest request) {
        log.info("Starting background AI processing for materialId={}", materialId);
        Material material = materialRepository.findById(materialId).orElse(null);
        if (material == null) {
            log.warn("Material with id {} not found for AI processing", materialId);
            return;
        }

        try {
            Map<String, Object> rawAiResult = planningAiClient.generatePlanning(request);
            PlanningAiResult normalizedResult = planningAiResultNormalizer.normalize(rawAiResult);

            material.setRawJson(normalizedResult.normalizedRawJson());
            material.setStatus("COMPLETED");
            log.info("Successfully completed AI processing for materialId={}", materialId);
        } catch (InvalidAiPlanningResultException e) {
            log.warn("AI planning failed for materialId={}: {}", materialId, e.getMessage());
            material.setRawJson(null);
            material.setStatus("FAILED");
        } catch (Exception e) {
            log.error("Unexpected error during AI processing for materialId={}", materialId, e);
            material.setRawJson(null);
            material.setStatus("FAILED");
        }

        materialRepository.save(material);
    }
}
