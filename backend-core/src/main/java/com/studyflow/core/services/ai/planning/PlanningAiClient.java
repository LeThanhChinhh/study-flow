package com.studyflow.core.services.ai.planning;

import java.util.Map;

public interface PlanningAiClient {
    Map<String, Object> generatePlanning(PlanningAiRequest request);
}
