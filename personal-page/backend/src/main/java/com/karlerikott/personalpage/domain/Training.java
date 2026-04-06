package com.karlerikott.personalpage.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "training", indexes = @Index(name = "idx_training_created_at", columnList = "created_at"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Training {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrainingType type;

    @Column
    private String description;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(name = "strava_id")
    private Long stravaId;

    @PrePersist
    void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
