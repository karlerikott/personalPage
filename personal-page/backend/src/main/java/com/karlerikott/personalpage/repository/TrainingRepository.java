package com.karlerikott.personalpage.repository;

import com.karlerikott.personalpage.domain.Training;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrainingRepository extends JpaRepository<Training, Long> {
    List<Training> findAllByOrderByCreatedAtDesc();
    boolean existsByStravaId(Long stravaId);
}
