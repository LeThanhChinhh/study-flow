package com.studyflow.core.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "studyflow.ai")
public class AiPlanningProperties {

    private Planning planning = new Planning();
    private Gemini gemini = new Gemini();

    public Planning getPlanning() {
        return planning;
    }

    public void setPlanning(Planning planning) {
        this.planning = planning;
    }

    public Gemini getGemini() {
        return gemini;
    }

    public void setGemini(Gemini gemini) {
        this.gemini = gemini;
    }

    public static class Planning {
        private String provider = "mock"; // mock or gemini

        public String getProvider() {
            return provider;
        }

        public void setProvider(String provider) {
            this.provider = provider;
        }
    }

    public static class Gemini {
        private String apiKey;
        private String model = "gemini-1.5-flash";
        private int timeoutSeconds = 60;

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public int getTimeoutSeconds() {
            return timeoutSeconds;
        }

        public void setTimeoutSeconds(int timeoutSeconds) {
            this.timeoutSeconds = timeoutSeconds;
        }

        @Override
        public String toString() {
            return "Gemini{" +
                    "apiKey='***'" + // Redact API key to avoid logging it
                    ", model='" + model + '\'' +
                    ", timeoutSeconds=" + timeoutSeconds +
                    '}';
        }
    }
}
