package com.studyflow.core.repositories;

import com.studyflow.core.entities.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {

    @Query("""
            SELECT attempt
            FROM QuizAttempt attempt
            JOIN FETCH attempt.quiz quiz
            WHERE attempt.userId = :userId
              AND quiz.task.id = :taskId
            ORDER BY attempt.answeredAt DESC
            """)
    List<QuizAttempt> findReviewAttempts(
            @Param("userId") UUID userId,
            @Param("taskId") UUID taskId
    );
}