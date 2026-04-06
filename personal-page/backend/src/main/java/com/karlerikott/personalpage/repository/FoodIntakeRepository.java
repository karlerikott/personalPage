package com.karlerikott.personalpage.repository;

import com.karlerikott.personalpage.domain.FoodIntake;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodIntakeRepository extends JpaRepository<FoodIntake, Long> {
    List<FoodIntake> findAllByOrderByCreatedAtDesc();
    boolean existsByMfpId(String mfpId);
}
