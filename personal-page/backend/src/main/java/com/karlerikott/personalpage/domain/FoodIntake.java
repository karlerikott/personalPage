package com.karlerikott.personalpage.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "food_intake", indexes = @Index(name = "idx_food_intake_created_at", columnList = "created_at"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Min(1) @Max(10000)
    @Column(nullable = false)
    private Integer kcal;

    @NotBlank
    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = Instant.now();
    }
}
