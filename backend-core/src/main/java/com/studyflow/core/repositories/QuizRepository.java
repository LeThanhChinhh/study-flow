package com.studyflow.core.repositories;

import com.studyflow.core.entities.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByTaskId(UUID taskId);
    Optional<Quiz> findByIdAndTaskUserId(UUID quizId, UUID userId);
}