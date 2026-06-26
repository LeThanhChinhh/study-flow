package com.studyflow.core.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_settings")
public class UserSettings {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "timezone", nullable = false, length = 50)
    private String timezone = "Asia/Ho_Chi_Minh";

    @Column(name = "pomodoro_duration", nullable = false)
    private Integer pomodoroDuration = 25;

    @Column(name = "short_break_duration", nullable = false)
    private Integer shortBreakDuration = 5;

    @Column(name = "theme", nullable = false, length = 20)
    private String theme = "LIGHT";

    @Column(name = "language", nullable = false, length = 10)
    private String language = "vi";

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public UUID getUserId() {
        return userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTimezone() {
        return timezone;
    }

    public Integer getPomodoroDuration() {
        return pomodoroDuration;
    }

    public Integer getShortBreakDuration() {
        return shortBreakDuration;
    }

    public String getTheme() {
        return theme;
    }

    public String getLanguage() {
        return language;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}