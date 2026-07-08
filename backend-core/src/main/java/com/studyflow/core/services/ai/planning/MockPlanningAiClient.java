package com.studyflow.core.services.ai.planning;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(prefix = "studyflow.ai.planning", name = "provider", havingValue = "mock", matchIfMissing = true)
public class MockPlanningAiClient implements PlanningAiClient {

    @Override
    public Map<String, Object> generatePlanning(PlanningAiRequest request) {
        return Map.of(
                "source", "mock-planning-flow",
                "fileName", request.getFileName(),
                "modules", List.of(
                        Map.of(
                                "title", "Tổng quan tài liệu",
                                "orderIndex", 1,
                                "tasks", List.of(
                                        Map.of(
                                                "title", "Đọc và tóm tắt nội dung chính",
                                                "estimatedMinutes", 25
                                        ),
                                        Map.of(
                                                "title", "Ôn tập các ý quan trọng",
                                                "estimatedMinutes", 25
                                        )
                                )
                        )
                )
        );
    }
}
