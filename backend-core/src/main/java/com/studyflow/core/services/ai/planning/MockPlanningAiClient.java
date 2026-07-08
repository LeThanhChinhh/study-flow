package com.studyflow.core.services.ai.planning;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
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
