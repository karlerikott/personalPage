package com.karlerikott.personalpage.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "food_intake")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer kcal;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = Instant.now();
    }
}
