package com.studyflow.core.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Entity
@Table(name = "quiz_options")
@Getter
@Setter
public class QuizOption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "option_text", nullable = false, columnDefinition = "text")
    private String text;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;
}