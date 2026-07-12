package com.studyflow.core.repositories;

import com.studyflow.core.entities.PomodoroLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PomodoroLogRepository extends JpaRepository<PomodoroLog, UUID> {
    List<PomodoroLog> findByTaskIdAndTaskUserId(UUID taskId, UUID userId);
    List<PomodoroLog> findByTaskUserId(UUID userId);

    Optional<PomodoroLog> findByTaskIdAndClientSessionId(UUID taskId, UUID clientSessionId);

    @Modifying
    @Query(value = "INSERT INTO pomodoro_logs (id, task_id, client_session_id, start_time, end_time, focus_minutes, break_minutes, pause_count, status, created_at, updated_at) " +
                   "VALUES (gen_random_uuid(), :#{#log.task.id}, :#{#log.clientSessionId}, :#{#log.startTime}, :#{#log.endTime}, :#{#log.focusMinutes}, :#{#log.breakMinutes}, :#{#log.pauseCount}, :#{#log.status}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
                   "ON CONFLICT (task_id, client_session_id) DO NOTHING", nativeQuery = true)
    int insertIfNotExists(@Param("log") PomodoroLog log);
}