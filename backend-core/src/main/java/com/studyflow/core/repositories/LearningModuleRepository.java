package com.studyflow.core.repositories;

import com.studyflow.core.entities.LearningModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LearningModuleRepository extends JpaRepository<LearningModule, UUID> {

    List<LearningModule> findByGoalIdOrderByOrderIndexAsc(UUID goalId);
}
