package com.studyflow.core.services;

import com.studyflow.core.dtos.quiz.*;
import com.studyflow.core.entities.*;
import com.studyflow.core.repositories.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.studyflow.core.services.ai.GeminiQuizClient;
import com.studyflow.core.services.ai.QuizAiResultNormalizer;
import com.studyflow.core.services.ai.QuizAiResultNormalizer.QuizAiResult;
import com.studyflow.core.services.ai.QuizAiResultNormalizer.QuizQuestion;
import com.studyflow.core.services.ai.QuizAiResultNormalizer.QuizOptionItem;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;
    private final LearningModuleRepository learningModuleRepository;
    private final GeminiQuizClient geminiQuizClient;
    private final QuizAiResultNormalizer quizAiResultNormalizer;

    public QuizService(QuizRepository quizRepository,
                       QuizOptionRepository quizOptionRepository,
                       QuizAttemptRepository quizAttemptRepository,
                       TaskRepository taskRepository,
                       GoalRepository goalRepository,
                       LearningModuleRepository learningModuleRepository,
                       GeminiQuizClient geminiQuizClient,
                       QuizAiResultNormalizer quizAiResultNormalizer) {
        this.quizRepository = quizRepository;
        this.quizOptionRepository = quizOptionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.taskRepository = taskRepository;
        this.goalRepository = goalRepository;
        this.learningModuleRepository = learningModuleRepository;
        this.geminiQuizClient = geminiQuizClient;
        this.quizAiResultNormalizer = quizAiResultNormalizer;
    }

    /**
     * Sinh Quiz từ Gemini AI cho một Task (2 câu hỏi, mỗi câu 4 lựa chọn)
     */
    @Transactional
    public List<QuizResponse> generateQuiz(UUID taskId) {
        UUID userId = getCurrentUserId(); // Lấy user từ JWT [1, 6]
        
        // Kiểm tra Task tồn tại và thuộc sở hữu của User [3, 7]
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Task không tồn tại hoặc không thuộc quyền sở hữu"));

        List<Quiz> existingQuizzes = quizRepository.findByTaskId(taskId);
        if (!existingQuizzes.isEmpty()) {
            return existingQuizzes.stream()
                    .map(this::toResponse)
                    .toList();
        }

        String goalTitle = "";
        if (task.getGoalId() != null) {
            goalTitle = goalRepository.findById(task.getGoalId()).map(Goal::getTitle).orElse("");
        }
        
        String moduleTitle = "";
        if (task.getModuleId() != null) {
            moduleTitle = learningModuleRepository.findById(task.getModuleId()).map(LearningModule::getTitle).orElse("");
        }

        String prompt = buildPrompt(task.getTitle(), moduleTitle, goalTitle);

        Map<String, Object> rawAiResponse = geminiQuizClient.generateQuiz(prompt);
        QuizAiResult aiResult = quizAiResultNormalizer.normalize(rawAiResponse);

        List<QuizResponse> quizDtos = new ArrayList<>();

        for (QuizQuestion q : aiResult.questions()) {
            Quiz quiz = new Quiz();
            quiz.setTask(task);
            quiz.setQuestionText(q.questionText());
            Quiz savedQuiz = quizRepository.save(quiz);

            List<QuizOptionResponse> optionDtos = new ArrayList<>();
            for (QuizOptionItem opt : q.options()) {
                QuizOption option = new QuizOption();
                option.setQuiz(savedQuiz);
                option.setText(opt.text());
                option.setIsCorrect(opt.correct());
                quizOptionRepository.save(option);

                optionDtos.add(new QuizOptionResponse(option.getId(), option.getText()));
            }

            quizDtos.add(new QuizResponse(savedQuiz.getId(), taskId, savedQuiz.getQuestionText(), optionDtos));
        }

        return quizDtos;
    }

    private String buildPrompt(String taskTitle, String moduleTitle, String goalTitle) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert tutor creating a quiz for a student.\n");
        sb.append("Based on the following context, generate exactly 2 multiple-choice active recall questions.\n");
        sb.append("Context:\n");
        if (!goalTitle.isEmpty()) {
            sb.append("- Goal: ").append(goalTitle).append("\n");
        }
        if (!moduleTitle.isEmpty()) {
            sb.append("- Module: ").append(moduleTitle).append("\n");
        }
        sb.append("- Task: ").append(taskTitle).append("\n\n");
        
        sb.append("Requirements:\n");
        sb.append("1. Generate exactly 2 multiple-choice questions. The questions array must contain exactly 2 question objects.\n");
        sb.append("2. Each question has exactly 4 options.\n");
        sb.append("3. Exactly one correct option per question.\n");
        sb.append("4. Use only the provided context. If context is too short, infer reasonable general knowledge related to the titles, but avoid overly specific fabricated details.\n");
        sb.append("5. Do not include markdown fences. Return pure JSON only.\n");
        sb.append("6. Avoid vague questions like 'What did you learn?'. Prefer conceptual understanding.\n\n");
        
        sb.append("Output format (JSON):\n");
        sb.append("{\n");
        sb.append("  \"questions\": [\n");
        sb.append("    {\n");
        sb.append("      \"questionText\": \"...\",\n");
        sb.append("      \"options\": [\n");
        sb.append("        { \"text\": \"...\", \"isCorrect\": true },\n");
        sb.append("        { \"text\": \"...\", \"isCorrect\": false },\n");
        sb.append("        { \"text\": \"...\", \"isCorrect\": false },\n");
        sb.append("        { \"text\": \"...\", \"isCorrect\": false }\n");
        sb.append("      ]\n");
        sb.append("    },\n");
        sb.append("    {\n");
        sb.append("      \"questionText\": \"...\",\n");
        sb.append("      \"options\": [\n");
        sb.append("        { \"text\": \"...\", \"isCorrect\": true },\n");
        sb.append("        { \"text\": \"...\", \"isCorrect\": false },\n");
        sb.append("        { \"text\": \"...\", \"isCorrect\": false },\n");
        sb.append("        { \"text\": \"...\", \"isCorrect\": false }\n");
        sb.append("      ]\n");
        sb.append("    }\n");
        sb.append("  ]\n");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Lấy Quiz theo TaskId (Ẩn đáp án đúng)
     */
    @Transactional(readOnly = true)
    public List<QuizResponse> getQuizByTask(UUID taskId) {
        UUID userId = getCurrentUserId();
        
        // Check ownership task
        taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Không có quyền truy cập Task này"));

        List<Quiz> quizzes = quizRepository.findByTaskId(taskId);
        if (quizzes.isEmpty()) {
            throw new IllegalArgumentException("Chưa có Quiz cho Task này. Hãy tạo mới.");
        }

        List<QuizResponse> quizResponses = new ArrayList<>();
        for (Quiz quiz : quizzes) {
            List<QuizOption> options = quizOptionRepository.findByQuizId(quiz.getId());
            List<QuizOptionResponse> optionResponses = options.stream()
                    .map(opt -> new QuizOptionResponse(opt.getId(), opt.getText()))
                    .toList();

            quizResponses.add(new QuizResponse(quiz.getId(), taskId, quiz.getQuestionText(), optionResponses));
        }

        return quizResponses;
    }

    /**
     * Nộp bài, chấm điểm và lưu kết quả
     */
    @Transactional
    public QuizSubmitResponse submitQuiz(QuizSubmitRequest request) {
        UUID userId = getCurrentUserId();
        
        List<QuizSubmitRequest.AnswerDTO> answers = request.answers();
        Set<UUID> quizIds = new HashSet<>();
        Set<UUID> answerOptionIds = new HashSet<>();
        for (QuizSubmitRequest.AnswerDTO answer : answers) {
            quizIds.add(answer.quizId());
            answerOptionIds.add(answer.selectedOptionId());
        }

        if (quizIds.size() != answers.size()) {
            throw new IllegalArgumentException("Duplicate quizId is not allowed");
        }

        List<Quiz> quizzes = quizRepository.findAllById(quizIds);
        if (quizzes.size() != quizIds.size()) {
            throw new IllegalArgumentException("Một hoặc nhiều quizId không hợp lệ.");
        }

        Quiz firstQuiz = quizzes.get(0);
        UUID taskId = firstQuiz.getTask().getId();
        boolean sameTask = quizzes.stream()
                .allMatch(q -> q.getTask().getId().equals(taskId));
        if (!sameTask) {
            throw new IllegalArgumentException("Tất cả các câu trả lời phải thuộc cùng một Task.");
        }

        for (Quiz quizItem : quizzes) {
            if (!quizItem.getTask().getUserId().equals(userId)) {
                throw new IllegalArgumentException("Không có quyền truy cập một hoặc nhiều quiz trong request.");
            }
        }

        List<QuizOption> selectedOptions = quizOptionRepository.findAllById(answerOptionIds);
        if (selectedOptions.size() != answerOptionIds.size()) {
            throw new IllegalArgumentException("Một hoặc nhiều selectedOptionId không hợp lệ.");
        }

        Map<UUID, QuizOption> optionById = new HashMap<>();
        selectedOptions.forEach(opt -> optionById.put(opt.getId(), opt));

        long correctCount = 0;
        for (QuizSubmitRequest.AnswerDTO answer : answers) {
            QuizOption option = optionById.get(answer.selectedOptionId());
            if (option == null || !option.getQuiz().getId().equals(answer.quizId())) {
                throw new IllegalArgumentException("selectedOptionId không khớp với quizId.");
            }
            if (Boolean.TRUE.equals(option.getIsCorrect())) {
                correctCount++;
            }
        }

        int totalQuestions = answers.size();
        int scorePercent = totalQuestions > 0
                ? (int) Math.round(correctCount * 100.0 / totalQuestions)
                : 0;

        List<QuestionResultDto> results = new ArrayList<>();

        // 3. Lưu mỗi câu trả lời dưới dạng một QuizAttempt riêng biệt [9, 10]
        for (QuizSubmitRequest.AnswerDTO answer : answers) {
            Quiz quizItem = quizzes.stream()
                    .filter(q -> q.getId().equals(answer.quizId()))
                    .findFirst()
                    .orElseThrow();
                    
            List<QuizOption> optionsForQuiz = quizOptionRepository.findByQuizId(quizItem.getId());
            
            List<QuizOption> correctOptions = optionsForQuiz.stream().filter(opt -> Boolean.TRUE.equals(opt.getIsCorrect())).toList();
            if (correctOptions.size() != 1) {
                throw new IllegalStateException("Data error: Quiz must have exactly one correct option.");
            }
            UUID correctOptionId = correctOptions.get(0).getId();
            
            List<QuizOptionResponse> optionResponses = optionsForQuiz.stream()
                    .map(opt -> new QuizOptionResponse(opt.getId(), opt.getText()))
                    .toList();
            
            boolean isCorrect = Boolean.TRUE.equals(optionById.get(answer.selectedOptionId()).getIsCorrect());
            
            results.add(new QuestionResultDto(
                quizItem.getId(),
                quizItem.getQuestionText(),
                answer.selectedOptionId(),
                correctOptionId,
                isCorrect,
                optionResponses
            ));

            QuizAttempt attempt = new QuizAttempt();
            attempt.setQuiz(quizItem);
            attempt.setUserId(userId);
            attempt.setSelectedOptionId(answer.selectedOptionId());
            attempt.setIsCorrect(isCorrect);
            attempt.setAnsweredAt(OffsetDateTime.now());
            quizAttemptRepository.save(attempt);
        }

        boolean completedTask = false;
        if (Boolean.TRUE.equals(request.completeTaskAfterSubmit())) {
            Task task = firstQuiz.getTask();
            task.setStatus("COMPLETED");
            taskRepository.save(task);
            completedTask = true;
        }

        return new QuizSubmitResponse(totalQuestions, (int) correctCount, scorePercent, completedTask, results);
    }

    private QuizResponse toResponse(Quiz quiz) {
        List<QuizOptionResponse> optionResponses = quizOptionRepository.findByQuizId(quiz.getId())
                .stream()
                .map(option -> new QuizOptionResponse(option.getId(), option.getText()))
                .toList();

        return new QuizResponse(
                quiz.getId(),
                quiz.getTask().getId(),
                quiz.getQuestionText(),
                optionResponses
        );
    }
    /**
     * Hỗ trợ lấy UserId hiện tại từ JWT Token [6]
     */
    private UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("Người dùng chưa xác thực");
        }
        // Giả định Name trong Token lưu ID người dùng (UUID)
        return UUID.fromString(auth.getName());
    }
}