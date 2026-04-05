package com.karlerikott.personalpage.service;

import com.karlerikott.personalpage.domain.Training;
import com.karlerikott.personalpage.domain.TrainingType;
import com.karlerikott.personalpage.repository.TrainingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingRepository repository;

    public Training save(TrainingType type, String description) {
        return repository.save(Training.builder()
                .type(type)
                .description(description)
                .build());
    }

    public List<Training> findAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }
}
