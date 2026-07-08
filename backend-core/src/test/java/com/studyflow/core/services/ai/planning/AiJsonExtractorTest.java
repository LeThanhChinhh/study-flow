package com.studyflow.core.services.ai.planning;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyflow.core.exceptions.InvalidAiPlanningResultException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class AiJsonExtractorTest {

    private AiJsonExtractor extractor;

    @BeforeEach
    void setUp() {
        extractor = new AiJsonExtractor(new ObjectMapper());
    }

    @Test
    void extractToMap_CleanJson_ReturnsMap() {
        String json = "{ \"test\": \"value\" }";
        Map<String, Object> result = extractor.extractToMap(json);
        assertEquals("value", result.get("test"));
    }

    @Test
    void extractToMap_FencedJson_ReturnsMap() {
        String json = "```json\n{ \"test\": \"value\" }\n```";
        Map<String, Object> result = extractor.extractToMap(json);
        assertEquals("value", result.get("test"));
    }

    @Test
    void extractToMap_ExtraText_ReturnsMap() {
        String json = "Here is the result:\n{ \"test\": \"value\" }\nHope it helps!";
        Map<String, Object> result = extractor.extractToMap(json);
        assertEquals("value", result.get("test"));
    }

    @Test
    void extractToMap_EmptyOrNull_ThrowsException() {
        assertThrows(InvalidAiPlanningResultException.class, () -> extractor.extractToMap(null));
        assertThrows(InvalidAiPlanningResultException.class, () -> extractor.extractToMap("   "));
    }

    @Test
    void extractToMap_InvalidJson_ThrowsException() {
        String json = "This is just text without any JSON object.";
        assertThrows(InvalidAiPlanningResultException.class, () -> extractor.extractToMap(json));
    }

    @Test
    void extractToMap_SkipsInvalidBraceBlockAndFindsValidJson_ReturnsMap() {
        String text = "Use {JSON} format:\n{ \"test\": \"value\" }";
        Map<String, Object> result = extractor.extractToMap(text);
        assertEquals("value", result.get("test"));
    }

    @Test
    void extractToMap_JsonContainsBracesInsideString_ReturnsMap() {
        String text = "Result:\n{ \"title\": \"Learn {advanced} Java\", \"minutes\": 25 }";
        Map<String, Object> result = extractor.extractToMap(text);
        assertEquals("Learn {advanced} Java", result.get("title"));
    }
}
