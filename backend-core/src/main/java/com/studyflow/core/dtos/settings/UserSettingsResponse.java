package com.studyflow.core.dtos.settings;

public class UserSettingsResponse {
    private Integer pomodoroDuration;
    private Integer shortBreakDuration;

    public UserSettingsResponse() {
    }

    public UserSettingsResponse(Integer pomodoroDuration, Integer shortBreakDuration) {
        this.pomodoroDuration = pomodoroDuration;
        this.shortBreakDuration = shortBreakDuration;
    }

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
