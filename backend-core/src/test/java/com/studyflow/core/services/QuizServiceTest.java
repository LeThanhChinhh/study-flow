package com.studyflow.core.services;

import com.studyflow.core.dtos.quiz.QuizReviewResponse;
import com.studyflow.core.entities.Quiz;
import com.studyflow.core.entities.QuizAttempt;
import com.studyflow.core.entities.QuizOption;
import com.studyflow.core.entities.Task;
import com.studyflow.core.exceptions.ResourceNotFoundException;
import com.studyflow.core.repositories.GoalRepository;
import com.studyflow.core.repositories.LearningModuleRepository;
import com.studyflow.core.repositories.QuizAttemptRepository;
import com.studyflow.core.repositories.QuizOptionRepository;
import com.studyflow.core.repositories.QuizRepository;
import com.studyflow.core.repositories.TaskRepository;
import com.studyflow.core.services.ai.GeminiQuizClient;
import com.studyflow.core.services.ai.QuizAiResultNormalizer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuizOptionRepository quizOptionRepository;

    @Mock
    private QuizAttemptRepository quizAttemptRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private LearningModuleRepository learningModuleRepository;

    @Mock
    private GeminiQuizClient geminiQuizClient;

    @Mock
    private QuizAiResultNormalizer quizAiResultNormalizer;

    @InjectMocks
    private QuizService quizService;

    private UUID userId;

    @BeforeEach
    void setUpAuthentication() {
        userId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of())
        );
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getQuizReviewReturnsLatestSavedAnswers() {
        UUID taskId = UUID.randomUUID();
        Task task = task(taskId, userId, "Review graph traversal");
        Quiz firstQuiz = quiz(task, "Which structure does BFS use?", OffsetDateTime.now().minusMinutes(2));
        Quiz secondQuiz = quiz(task, "What does DFS explore first?", OffsetDateTime.now().minusMinutes(1));

        QuizOption firstCorrect = option(firstQuiz, "Queue", true);
        QuizOption firstWrong = option(firstQuiz, "Stack", false);
        QuizOption secondCorrect = option(secondQuiz, "A branch as deeply as possible", true);
        QuizOption secondWrong = option(secondQuiz, "Every neighbor at once", false);

        QuizAttempt newestFirstAttempt = attempt(firstQuiz, firstCorrect, true, OffsetDateTime.now());
        QuizAttempt olderFirstAttempt = attempt(firstQuiz, firstWrong, false, OffsetDateTime.now().minusDays(1));
        QuizAttempt secondAttempt = attempt(secondQuiz, secondWrong, false, OffsetDateTime.now().minusSeconds(5));

        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task));
        when(quizAttemptRepository.findReviewAttempts(userId, taskId))
                .thenReturn(List.of(newestFirstAttempt, secondAttempt, olderFirstAttempt));
        when(quizOptionRepository.findByQuizId(firstQuiz.getId()))
                .thenReturn(List.of(firstCorrect, firstWrong));
        when(quizOptionRepository.findByQuizId(secondQuiz.getId()))
                .thenReturn(List.of(secondCorrect, secondWrong));

        QuizReviewResponse response = quizService.getQuizReview(taskId);

        assertThat(response.taskId()).isEqualTo(taskId);
        assertThat(response.taskTitle()).isEqualTo("Review graph traversal");
        assertThat(response.totalQuestions()).isEqualTo(2);
        assertThat(response.correctAnswers()).isEqualTo(1);
        assertThat(response.scorePercent()).isEqualTo(50);
        assertThat(response.results()).hasSize(2);
        assertThat(response.results().get(0).selectedOptionId()).isEqualTo(firstCorrect.getId());
        assertThat(response.results().get(1).selectedOptionId()).isEqualTo(secondWrong.getId());
    }

    @Test
    void getQuizReviewRejectsTaskWithoutSubmittedAttempt() {
        UUID taskId = UUID.randomUUID();
        Task task = task(taskId, userId, "Task without quiz attempt");

        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task));
        when(quizAttemptRepository.findReviewAttempts(userId, taskId)).thenReturn(List.of());

        assertThatThrownBy(() -> quizService.getQuizReview(taskId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("No submitted quiz review found for this task");
    }

    private static Task task(UUID taskId, UUID ownerId, String title) {
        Task task = new Task();
        task.setId(taskId);
        task.setUserId(ownerId);
        task.setTitle(title);
        return task;
    }

    private static Quiz quiz(Task task, String question, OffsetDateTime createdAt) {
        Quiz quiz = new Quiz();
        quiz.setId(UUID.randomUUID());
        quiz.setTask(task);
        quiz.setQuestionText(question);
        quiz.setCreatedAt(createdAt);
        return quiz;
    }

    private static QuizOption option(Quiz quiz, String text, boolean correct) {
        QuizOption option = new QuizOption();
        option.setId(UUID.randomUUID());
        option.setQuiz(quiz);
        option.setText(text);
        option.setIsCorrect(correct);
        return option;
    }

    private static QuizAttempt attempt(
            Quiz quiz,
            QuizOption selectedOption,
            boolean correct,
            OffsetDateTime answeredAt
    ) {
        QuizAttempt attempt = new QuizAttempt();
        attempt.setId(UUID.randomUUID());
        attempt.setQuiz(quiz);
        attempt.setUserId(quiz.getTask().getUserId());
        attempt.setSelectedOptionId(selectedOption.getId());
        attempt.setIsCorrect(correct);
        attempt.setAnsweredAt(answeredAt);
        return attempt;
    }
}
