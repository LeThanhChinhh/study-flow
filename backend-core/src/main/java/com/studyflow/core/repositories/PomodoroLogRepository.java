package com.studyflow.core.repositories;

import com.studyflow.core.entities.PomodoroLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PomodoroLogRepository extends JpaRepository<PomodoroLog, UUID> {
    List<PomodoroLog> findByTaskIdAndTaskUserId(UUID taskId, UUID userId);
    List<PomodoroLog> findByTaskUserId(UUID userId);
}