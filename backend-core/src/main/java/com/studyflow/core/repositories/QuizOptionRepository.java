package com.studyflow.core.repositories;

import com.studyflow.core.entities.QuizOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizOptionRepository extends JpaRepository<QuizOption, UUID> {

    // Lấy tất cả lựa chọn cho một Quiz cụ thể [5]
    List<QuizOption> findByQuizId(UUID quizId);
}