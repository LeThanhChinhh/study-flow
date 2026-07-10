package com.studyflow.core.services.ai;

import com.studyflow.core.services.ai.planning.AiJsonExtractor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class GeminiQuizClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiQuizClient.class);

    private final String apiKey;
    private final String model;
    private final AiJsonExtractor aiJsonExtractor;
    private final RestTemplate restTemplate;

    public GeminiQuizClient(
            @Value("${studyflow.ai.gemini.api-key:}") String apiKey,
            @Value("${studyflow.ai.gemini.model:gemini-1.5-flash}") String model,
            @Value("${studyflow.ai.gemini.timeout-seconds:60}") int timeoutSeconds,
            AiJsonExtractor aiJsonExtractor) {
        this.apiKey = apiKey;
        this.model = model;
        this.aiJsonExtractor = aiJsonExtractor;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        Duration timeout = Duration.ofSeconds(Math.max(1, timeoutSeconds));
        requestFactory.setConnectTimeout(timeout);
        requestFactory.setReadTimeout(timeout);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    public Map<String, Object> generateQuiz(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("Gemini API key is not configured");
        }

        String effectiveModel = (model == null || model.trim().isEmpty()) ? "gemini-1.5-flash" : model;
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + effectiveModel + ":generateContent";

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "responseMimeType", "application/json"
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        int maxAttempts = 3;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                @SuppressWarnings("unchecked")
                ResponseEntity<Map<?, ?>> response = (ResponseEntity<Map<?, ?>>) (ResponseEntity) restTemplate.postForEntity(url, entity, Map.class);
                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    throw new IllegalStateException("Gemini API returned an error or empty response");
                }

                String rawText = extractTextFromResponse(response.getBody());
                if (rawText == null || rawText.isEmpty()) {
                    throw new IllegalStateException("Gemini API response did not contain text");
                }

                return aiJsonExtractor.extractToMap(rawText);
            } catch (HttpStatusCodeException e) {
                int status = e.getStatusCode().value();
                if (status == 429 || status == 500 || status == 502 || status == 503 || status == 504) {
                    if (attempt == maxAttempts) {
                        log.error("Gemini API failed with status {} after {} attempts", status, maxAttempts);
                        break;
                    }
                    long delay = (attempt == 1) ? 800 : 1600;
                    log.warn("Gemini API returned status {}. Retrying in {}ms (Attempt {}/{})", status, delay, attempt + 1, maxAttempts);
                    sleepSafely(delay);
                } else {
                    log.error("Gemini API failed with non-retriable status {}: {}", status, e.getMessage());
                    throw new IllegalStateException("Gemini quiz generation is temporarily unavailable. Please try again.", e);
                }
            } catch (ResourceAccessException e) {
                if (attempt == maxAttempts) {
                    log.error("Gemini API network/timeout error after {} attempts: {}", maxAttempts, e.getMessage());
                    break;
                }
                long delay = (attempt == 1) ? 800 : 1600;
                log.warn("Gemini API network/timeout error. Retrying in {}ms (Attempt {}/{})", delay, attempt + 1, maxAttempts);
                sleepSafely(delay);
            } catch (Exception e) {
                log.error("Unexpected error calling Gemini API: {}", e.getMessage());
                throw new IllegalStateException("Gemini quiz generation is temporarily unavailable. Please try again.", e);
            }
        }
        
        throw new IllegalStateException("Gemini quiz generation is temporarily unavailable. Please try again.");
    }

    private void sleepSafely(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String extractTextFromResponse(Map<?, ?> responseBody) {
        try {
            Object candidatesObj = responseBody.get("candidates");
            if (!(candidatesObj instanceof List<?> candidates) || candidates.isEmpty()) return null;

            Object firstCandidateObj = candidates.get(0);
            if (!(firstCandidateObj instanceof Map<?, ?> firstCandidate)) return null;

            Object contentObj = firstCandidate.get("content");
            if (!(contentObj instanceof Map<?, ?> content)) return null;

            Object partsObj = content.get("parts");
            if (!(partsObj instanceof List<?> parts) || parts.isEmpty()) return null;

            StringBuilder sb = new StringBuilder();
            for (Object partObj : parts) {
                if (partObj instanceof Map<?, ?> part) {
                    Object textObj = part.get("text");
                    if (textObj instanceof String text) {
                        sb.append(text);
                    }
                }
            }
            return sb.toString();
        } catch (Exception e) {
            return null;
        }
    }
}
