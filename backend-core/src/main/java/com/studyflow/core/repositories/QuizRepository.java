package com.studyflow.core.repositories;

import com.studyflow.core.entities.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {

    // Tìm tất cả câu hỏi Quiz gắn liền với một Task cụ thể [4]
    List<Quiz> findByTaskId(UUID taskId);

    // Kiểm tra Quiz tồn tại và thuộc sở hữu của User hiện tại thông qua quan hệ với Task [2], [5]
    Optional<Quiz> findByIdAndTaskUserId(UUID quizId, UUID userId);
}