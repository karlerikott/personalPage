package com.karlerikott.personalpage.repository;

import com.karlerikott.personalpage.domain.Weight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WeightRepository extends JpaRepository<Weight, Long> {
    List<Weight> findAllByOrderByCreatedAtAsc();
}
