package com.karlerikott.personalpage.service;

import com.karlerikott.personalpage.domain.FoodIntake;
import com.karlerikott.personalpage.repository.FoodIntakeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodIntakeService {

    private final FoodIntakeRepository repository;

    public FoodIntake save(int kcal, String description) {
        return repository.save(FoodIntake.builder()
                .kcal(kcal)
                .description(description)
                .build());
    }

    public List<FoodIntake> findAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }
}
