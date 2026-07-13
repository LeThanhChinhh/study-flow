package com.studyflow.core.services.ai;

import com.studyflow.core.exceptions.InvalidAiPlanningResultException;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PlanningAiResultNormalizerTest {

    private final PlanningAiResultNormalizer normalizer = new PlanningAiResultNormalizer();

    @Test
    void normalizeAppliesDefaultsAndTrimsValues() {
        Map<String, Object> raw = Map.of(
                "source", " gemini ",
                "modules", List.of(
                        Map.of(
                                "title", " Graph Foundations ",
                                "tasks", List.of(
                                        Map.of("title", " Learn graph terminology "),
                                        Map.of("title", " Compare representations ", "estimatedMinutes", "30")
                                )
                        )
                )
        );

        PlanningAiResultNormalizer.PlanningAiResult result = normalizer.normalize(raw);

        assertThat(result.modules()).hasSize(1);
        assertThat(result.modules().getFirst().title()).isEqualTo("Graph Foundations");
        assertThat(result.modules().getFirst().tasks().getFirst().estimatedMinutes()).isEqualTo(25);
        assertThat(result.modules().getFirst().tasks().get(1).estimatedMinutes()).isEqualTo(30);
        assertThat(result.normalizedRawJson()).containsEntry("schemaVersion", 1);
        assertThat(result.normalizedRawJson()).containsEntry("source", "gemini");
    }

    @Test
    void normalizeRejectsDurationOutsideSupportedRange() {
        Map<String, Object> raw = Map.of(
                "modules", List.of(
                        Map.of(
                                "title", "Module",
                                "tasks", List.of(
                                        Map.of("title", "Oversized task", "estimatedMinutes", 181)
                                )
                        )
                )
        );

        assertThatThrownBy(() -> normalizer.normalize(raw))
                .isInstanceOf(InvalidAiPlanningResultException.class)
                .hasMessageContaining("between 1 and 180");
    }
}
