package com.studyflow.core.dtos.pomodoro;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PomodoroLogRequest {

    private UUID taskId;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Integer focusMinutes;
    private String status;
    private Integer breakMinutes;
    private Integer pauseCount;

    public UUID getTaskId() {
        return taskId;
    }

    public void setTaskId(UUID taskId) {
        this.taskId = taskId;
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