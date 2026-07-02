package com.studyflow.core.entities;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pomodoro_logs")
public class PomodoroLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(name = "start_time")
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Column(name = "focus_minutes", nullable = false)
    private Integer focusMinutes;

    @Column(name = "break_minutes", nullable = false)
    private Integer breakMinutes = 0;

    @Column(name = "pause_count", nullable = false)
    private Integer pauseCount = 0;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public OffsetDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(OffsetDateTime startTime) {
        this.startTime = startTime;
    }

    public OffsetDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(OffsetDateTime endTime) {
        this.endTime = endTime;
    }

    public Integer getFocusMinutes() {
        return focusMinutes;
    }

    public void setFocusMinutes(Integer focusMinutes) {
        this.focusMinutes = focusMinutes;
    }

    public Integer getBreakMinutes() {
        return breakMinutes;
    }

    public void setBreakMinutes(Integer breakMinutes) {
        this.breakMinutes = breakMinutes;
    }

    public Integer getPauseCount() {
        return pauseCount;
    }

    public void setPauseCount(Integer pauseCount) {
        this.pauseCount = pauseCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}