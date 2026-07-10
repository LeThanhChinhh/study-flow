package com.studyflow.core.services.ai;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class QuizAiResultNormalizer {

    public record QuizOptionItem(String text, boolean correct) {}
    public record QuizQuestion(String questionText, List<QuizOptionItem> options) {}
    public record QuizAiResult(List<QuizQuestion> questions) {}

    public QuizAiResult normalize(Map<String, Object> rawJson) {
        if (rawJson == null) {
            throw new IllegalArgumentException("rawJson is null");
        }
        
        Object questionsObj = rawJson.get("questions");
        if (!(questionsObj instanceof List<?> questionsList)) {
            throw new IllegalArgumentException("'questions' field is missing or not a list");
        }
        
        if (questionsList.size() != 2) {
            throw new IllegalArgumentException("Exactly 2 questions are required");
        }
        
        List<QuizQuestion> questions = questionsList.stream().map(qObj -> {
            if (!(qObj instanceof Map<?, ?> qMap)) {
                throw new IllegalArgumentException("Question must be an object");
            }
            
            Object textObj = qMap.get("questionText");
            if (!(textObj instanceof String) || ((String) textObj).trim().isEmpty()) {
                throw new IllegalArgumentException("'questionText' is missing or empty");
            }
            String qText = ((String) textObj).trim();
            if (qText.length() > 500) {
                throw new IllegalArgumentException("'questionText' exceeds 500 characters");
            }
            
            Object optionsObj = qMap.get("options");
            if (!(optionsObj instanceof List<?> optionsList)) {
                throw new IllegalArgumentException("'options' field is missing or not a list");
            }
            if (optionsList.size() != 4) {
                throw new IllegalArgumentException("Exactly 4 options are required per question");
            }
            
            List<QuizOptionItem> options = optionsList.stream().map(optObj -> {
                if (!(optObj instanceof Map<?, ?> optMap)) {
                    throw new IllegalArgumentException("Option must be an object");
                }
                Object optTextObj = optMap.get("text");
                if (!(optTextObj instanceof String) || ((String) optTextObj).trim().isEmpty()) {
                    throw new IllegalArgumentException("Option 'text' is missing or empty");
                }
                String optText = ((String) optTextObj).trim();
                if (optText.length() > 255) {
                    throw new IllegalArgumentException("Option 'text' exceeds 255 characters");
                }
                
                Object isCorrectObj = optMap.get("isCorrect");
                if (!(isCorrectObj instanceof Boolean)) {
                    throw new IllegalArgumentException("Option 'isCorrect' is missing or not a boolean");
                }
                boolean isCorrect = (Boolean) isCorrectObj;
                
                return new QuizOptionItem(optText, isCorrect);
            }).toList();
            
            long correctCount = options.stream().filter(QuizOptionItem::correct).count();
            if (correctCount != 1) {
                throw new IllegalArgumentException("Exactly one correct option is required per question");
            }
            
            return new QuizQuestion(qText, options);
        }).toList();
        
        return new QuizAiResult(questions);
    }
}
