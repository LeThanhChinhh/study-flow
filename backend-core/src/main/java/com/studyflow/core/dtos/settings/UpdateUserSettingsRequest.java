package com.studyflow.core.dtos.settings;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateUserSettingsRequest {

    @NotNull(message = "Pomodoro duration is required")
    @Min(value = 5, message = "Pomodoro duration must be at least 5 minutes")
    @Max(value = 90, message = "Pomodoro duration must not exceed 90 minutes")
    private Integer pomodoroDuration;

    @NotNull(message = "Short break duration is required")
    @Min(value = 1, message = "Short break duration must be at least 1 minute")
    @Max(value = 30, message = "Short break duration must not exceed 30 minutes")
    private Integer shortBreakDuration;

    public Integer getPomodoroDuration() {
        return pomodoroDuration;
    }

    public void setPomodoroDuration(Integer pomodoroDuration) {
        this.pomodoroDuration = pomodoroDuration;
    }

    public Integer getShortBreakDuration() {
        return shortBreakDuration;
    }

    public void setShortBreakDuration(Integer shortBreakDuration) {
        this.shortBreakDuration = shortBreakDuration;
    }
}
