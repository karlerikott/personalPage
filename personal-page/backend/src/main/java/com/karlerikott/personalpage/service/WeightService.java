package com.karlerikott.personalpage.service;

import com.karlerikott.personalpage.domain.Weight;
import com.karlerikott.personalpage.repository.WeightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WeightService {

    private final WeightRepository repository;

    public Weight save(double weightKg) {
        return repository.save(Weight.builder()
                .weightKg(weightKg)
                .build());
    }

    public List<Weight> findAll() {
        return repository.findAllByOrderByCreatedAtAsc();
    }
}
