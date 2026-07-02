package com.studyflow.core.controllers;

import com.studyflow.core.dtos.quiz.*;
import com.studyflow.core.services.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    /**
     * Sinh bộ câu hỏi trắc nghiệm (Mock) cho một Task cụ thể.
     * Endpoint: POST /api/v1/quizzes/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<List<QuizResponse>> generateQuiz(
            @Valid @RequestBody QuizGenerateRequest request
    ) {
        // Logic sinh quiz mock được xử lý tại Service
        List<QuizResponse> response = quizService.generateQuiz(request.taskId());
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy thông tin Quiz và các lựa chọn gắn liền với một Task.
     * Endpoint: GET /api/v1/quizzes/by-task/{taskId}
     * Lưu ý: Response trả về tuyệt đối không chứa trường isCorrect.
     */
    @GetMapping("/by-task/{taskId}")
    public ResponseEntity<List<QuizResponse>> getQuizByTask(
            @PathVariable UUID taskId
    ) {
        // Service sẽ kiểm tra quyền sở hữu Task trước khi trả về Quiz
        List<QuizResponse> response = quizService.getQuizByTask(taskId);
        return ResponseEntity.ok(response);
    }

    /**
     * Nộp kết quả làm bài, chấm điểm và lưu lịch sử.
     * Endpoint: POST /api/v1/quizzes/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<QuizSubmitResponse> submitQuiz(
            @Valid @RequestBody QuizSubmitRequest request
    ) {
        // Xử lý chấm điểm dựa trên database, không tin tưởng dữ liệu client gửi về
        QuizSubmitResponse response = quizService.submitQuiz(request);
        return ResponseEntity.ok(response);
    }
}