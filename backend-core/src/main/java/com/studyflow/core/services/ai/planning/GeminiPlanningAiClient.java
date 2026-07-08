package com.studyflow.core.services.ai.planning;

import com.studyflow.core.config.AiPlanningProperties;
import com.studyflow.core.exceptions.InvalidAiPlanningResultException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(prefix = "studyflow.ai.planning", name = "provider", havingValue = "gemini")
public class GeminiPlanningAiClient implements PlanningAiClient {

    private final AiPlanningProperties properties;
    private final AiJsonExtractor aiJsonExtractor;
    private final PlanningAiPromptBuilder promptBuilder;
    private final RestTemplate restTemplate;

    public GeminiPlanningAiClient(AiPlanningProperties properties,
                                  AiJsonExtractor aiJsonExtractor,
                                  PlanningAiPromptBuilder promptBuilder) {
        this.properties = properties;
        this.aiJsonExtractor = aiJsonExtractor;
        this.promptBuilder = promptBuilder;
        
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        int timeoutSeconds = Math.max(1, properties.getGemini().getTimeoutSeconds());
        Duration timeout = Duration.ofSeconds(timeoutSeconds);
        requestFactory.setConnectTimeout(timeout);
        requestFactory.setReadTimeout(timeout);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    @Override
    public Map<String, Object> generatePlanning(PlanningAiRequest request) {
        String apiKey = properties.getGemini().getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new InvalidAiPlanningResultException("Gemini API key is not configured");
        }

        String model = properties.getGemini().getModel();
        if (model == null || model.trim().isEmpty()) {
            model = "gemini-1.5-flash";
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";

        String prompt = promptBuilder.buildPlanningPrompt(request);
        
        String mimeType = "application/pdf";
        if ("application/pdf".equalsIgnoreCase(request.getContentType())) {
            mimeType = request.getContentType();
        }

        if (request.getFileBytes() == null || request.getFileBytes().length == 0) {
            throw new InvalidAiPlanningResultException("PDF content is empty");
        }
        
        String base64Data = Base64.getEncoder().encodeToString(request.getFileBytes());

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt),
                                        Map.of("inline_data", Map.of(
                                                "mime_type", mimeType,
                                                "data", base64Data
                                        ))
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

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new InvalidAiPlanningResultException("Gemini API returned an error or empty response. Status: " + response.getStatusCode());
            }

            String rawText = extractTextFromResponse(response.getBody());
            if (rawText == null || rawText.isEmpty()) {
                throw new InvalidAiPlanningResultException("Gemini API response did not contain text");
            }

            return aiJsonExtractor.extractToMap(rawText);

        } catch (RestClientException e) {
            throw new InvalidAiPlanningResultException("Error calling Gemini API: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromResponse(Map<String, Object> responseBody) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) return null;

            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
            if (content == null) return null;

            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) return null;

            StringBuilder sb = new StringBuilder();
            for (Map<String, Object> part : parts) {
                String text = (String) part.get("text");
                if (text != null) {
                    sb.append(text);
                }
            }
            return sb.toString();
        } catch (Exception e) {
            return null;
        }
    }
}
