package com.studyflow.core.services.ai.planning;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyflow.core.exceptions.InvalidAiPlanningResultException;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AiJsonExtractor {

    private final ObjectMapper objectMapper;
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    public AiJsonExtractor(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> extractToMap(String rawText) {
        if (rawText == null || rawText.trim().isEmpty()) {
            throw new InvalidAiPlanningResultException("AI response is empty");
        }

        String text = rawText.trim();

        // 1. Try to parse directly
        try {
            return parseMap(text);
        } catch (Exception ignored) {
            // Proceed to next fallback
        }

        // 2. Try to remove markdown code blocks
        String withoutFences = removeMarkdownFences(text);
        try {
            return parseMap(withoutFences);
        } catch (Exception ignored) {
            // Proceed to next fallback
        }

        // 3. Try to scan for the first balanced JSON object
        String extracted = extractFirstJsonObject(text);
        if (extracted != null) {
            try {
                return parseMap(extracted);
            } catch (Exception e) {
                throw new InvalidAiPlanningResultException("Found JSON-like block but failed to parse");
            }
        }

        throw new InvalidAiPlanningResultException("No valid JSON object found in AI response");
    }

    private Map<String, Object> parseMap(String text) throws JsonProcessingException {
        return objectMapper.readValue(text, MAP_TYPE);
    }

    private String removeMarkdownFences(String text) {
        String result = text;
        if (result.startsWith("```")) {
            int firstNewline = result.indexOf('\n');
            if (firstNewline != -1) {
                result = result.substring(firstNewline + 1);
            }
        }
        if (result.endsWith("```")) {
            result = result.substring(0, result.length() - 3);
        }
        return result.trim();
    }

    private String extractFirstJsonObject(String text) {
        for (int startIndex = text.indexOf('{'); startIndex != -1; startIndex = text.indexOf('{', startIndex + 1)) {
            String candidate = extractBalancedJsonObjectFrom(text, startIndex);
            if (candidate == null) {
                continue;
            }

            try {
                parseMap(candidate);
                return candidate;
            } catch (JsonProcessingException ignored) {
                // Try the next opening brace because earlier {...} may be plain text, not JSON.
            }
        }

        return null;
    }

    private String extractBalancedJsonObjectFrom(String text, int startIndex) {
        int braceCount = 0;
        boolean inString = false;
        boolean isEscape = false;

        for (int i = startIndex; i < text.length(); i++) {
            char c = text.charAt(i);

            if (inString) {
                if (isEscape) {
                    isEscape = false;
                } else if (c == '\\') {
                    isEscape = true;
                } else if (c == '"') {
                    inString = false;
                }
            } else {
                if (c == '"') {
                    inString = true;
                } else if (c == '{') {
                    braceCount++;
                } else if (c == '}') {
                    braceCount--;
                    if (braceCount == 0) {
                        return text.substring(startIndex, i + 1);
                    }
                }
            }
        }

        return null;
    }
}
