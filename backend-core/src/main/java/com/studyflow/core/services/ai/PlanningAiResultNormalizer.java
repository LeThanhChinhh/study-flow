package com.studyflow.core.services.ai;

import com.studyflow.core.exceptions.InvalidAiPlanningResultException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PlanningAiResultNormalizer {

    private static final int DEFAULT_ESTIMATED_MINUTES = 25;
    private static final int MIN_ESTIMATED_MINUTES = 1;
    private static final int MAX_ESTIMATED_MINUTES = 180;
    private static final int MAX_TITLE_LENGTH = 255;
    private static final int MAX_MODULES = 50;
    private static final int MAX_TASKS_PER_MODULE = 50;
    private static final int MAX_TOTAL_TASKS = 200;

    public PlanningAiResult normalize(Map<String, Object> rawJson) {
        if (rawJson == null || rawJson.isEmpty()) {
            throw new InvalidAiPlanningResultException("AI planning result cannot be null or empty");
        }

        Object modulesObject = rawJson.get("modules");
        if (!(modulesObject instanceof List<?> moduleObjects) || moduleObjects.isEmpty()) {
            throw new InvalidAiPlanningResultException("AI planning result must contain at least one module");
        }

        if (moduleObjects.size() > MAX_MODULES) {
            throw new InvalidAiPlanningResultException("AI planning result contains too many modules");
        }

        List<PlanningModule> modules = new ArrayList<>();
        List<Map<String, Object>> normalizedModulesJson = new ArrayList<>();
        int totalTasks = 0;

        for (int moduleIndex = 0; moduleIndex < moduleObjects.size(); moduleIndex++) {
            Object moduleObject = moduleObjects.get(moduleIndex);
            if (!(moduleObject instanceof Map<?, ?> moduleMap)) {
                throw new InvalidAiPlanningResultException("AI module item must be an object");
            }

            String moduleTitle = readString(moduleMap.get("title"), null);
            if (!StringUtils.hasText(moduleTitle)) {
                throw new InvalidAiPlanningResultException("AI module title is required");
            }
            moduleTitle = limitTitle(moduleTitle);

            Integer moduleOrderIndex = readInteger(moduleMap.get("orderIndex"), moduleIndex + 1);

            Object tasksObject = moduleMap.get("tasks");
            if (!(tasksObject instanceof List<?> taskObjects) || taskObjects.isEmpty()) {
                throw new InvalidAiPlanningResultException("AI module must contain at least one task");
            }

            if (taskObjects.size() > MAX_TASKS_PER_MODULE) {
                throw new InvalidAiPlanningResultException("AI module contains too many tasks");
            }

            List<PlanningTask> tasks = new ArrayList<>();
            List<Map<String, Object>> normalizedTasksJson = new ArrayList<>();

            for (Object taskObject : taskObjects) {
                if (!(taskObject instanceof Map<?, ?> taskMap)) {
                    throw new InvalidAiPlanningResultException("AI task item must be an object");
                }

                String taskTitle = readString(taskMap.get("title"), null);
                if (!StringUtils.hasText(taskTitle)) {
                    throw new InvalidAiPlanningResultException("AI task title is required");
                }
                taskTitle = limitTitle(taskTitle);

                int estimatedMinutes = readEstimatedMinutes(taskMap.get("estimatedMinutes"));
                if (estimatedMinutes < MIN_ESTIMATED_MINUTES || estimatedMinutes > MAX_ESTIMATED_MINUTES) {
                    throw new InvalidAiPlanningResultException("AI task estimatedMinutes must be between " + MIN_ESTIMATED_MINUTES + " and " + MAX_ESTIMATED_MINUTES);
                }

                tasks.add(new PlanningTask(taskTitle, estimatedMinutes));

                Map<String, Object> normalizedTaskJson = new LinkedHashMap<>();
                normalizedTaskJson.put("title", taskTitle);
                normalizedTaskJson.put("estimatedMinutes", estimatedMinutes);
                normalizedTasksJson.add(normalizedTaskJson);

                totalTasks++;
                if (totalTasks > MAX_TOTAL_TASKS) {
                    throw new InvalidAiPlanningResultException("AI planning result contains too many tasks");
                }
            }

            modules.add(new PlanningModule(moduleTitle, moduleOrderIndex, tasks));

            Map<String, Object> normalizedModuleJson = new LinkedHashMap<>();
            normalizedModuleJson.put("title", moduleTitle);
            normalizedModuleJson.put("orderIndex", moduleOrderIndex);
            normalizedModuleJson.put("tasks", normalizedTasksJson);
            normalizedModulesJson.add(normalizedModuleJson);
        }

        Map<String, Object> normalizedRawJson = new LinkedHashMap<>();
        normalizedRawJson.put("schemaVersion", 1);
        normalizedRawJson.put("source", readString(rawJson.get("source"), "ai-planning-flow"));

        Object fileName = rawJson.get("fileName");
        if (fileName != null) {
            normalizedRawJson.put("fileName", fileName);
        }

        normalizedRawJson.put("modules", normalizedModulesJson);

        return new PlanningAiResult(normalizedRawJson, modules);
    }

    private String readString(Object value, String defaultValue) {
        if (value instanceof String stringValue && StringUtils.hasText(stringValue)) {
            return stringValue.trim();
        }
        return defaultValue;
    }

    private Integer readInteger(Object value, Integer defaultValue) {
        if (value instanceof Number numberValue) {
            return numberValue.intValue();
        }

        if (value instanceof String stringValue && StringUtils.hasText(stringValue)) {
            try {
                return Integer.parseInt(stringValue.trim());
            } catch (NumberFormatException ignored) {
                return defaultValue;
            }
        }

        return defaultValue;
    }

    private int readEstimatedMinutes(Object value) {
        if (value == null) {
            return DEFAULT_ESTIMATED_MINUTES;
        }

        if (value instanceof Number numberValue) {
            double numericValue = numberValue.doubleValue();

            if (numericValue % 1 != 0) {
                throw new InvalidAiPlanningResultException("AI task estimatedMinutes must be an integer");
            }

            return numberValue.intValue();
        }

        if (value instanceof String stringValue) {
            String trimmedValue = stringValue.trim();

            if (!StringUtils.hasText(trimmedValue)) {
                return DEFAULT_ESTIMATED_MINUTES;
            }

            try {
                return Integer.parseInt(trimmedValue);
            } catch (NumberFormatException e) {
                throw new InvalidAiPlanningResultException("AI task estimatedMinutes must be an integer");
            }
        }

        throw new InvalidAiPlanningResultException("AI task estimatedMinutes must be an integer");
    }

    private String limitTitle(String value) {
        String title = value.trim();
        if (title.length() <= MAX_TITLE_LENGTH) {
            return title;
        }
        return title.substring(0, MAX_TITLE_LENGTH);
    }

    public record PlanningAiResult(
            Map<String, Object> normalizedRawJson,
            List<PlanningModule> modules
    ) {}

    public record PlanningModule(
            String title,
            int orderIndex,
            List<PlanningTask> tasks
    ) {}

    public record PlanningTask(
            String title,
            int estimatedMinutes
    ) {}
}
