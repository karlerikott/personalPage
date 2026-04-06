package com.karlerikott.personalpage.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "weight", indexes = @Index(name = "idx_weight_created_at", columnList = "created_at"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Weight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @DecimalMin("10.0") @DecimalMax("500.0")
    @Column(nullable = false)
    private Double weightKg;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = Instant.now();
    }
}
