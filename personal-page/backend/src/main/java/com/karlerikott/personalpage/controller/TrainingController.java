package com.karlerikott.personalpage.controller;

import com.karlerikott.personalpage.domain.Training;
import com.karlerikott.personalpage.domain.TrainingType;
import com.karlerikott.personalpage.service.TrainingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracker/training")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService service;

    record TrainingRequest(TrainingType type, String description) {}

    @PostMapping
    public ApiResponse<Training> create(@RequestBody TrainingRequest request) {
        return ApiResponse.ok(service.save(request.type(), request.description()));
    }

    @GetMapping
    public ApiResponse<List<Training>> findAll() {
        return ApiResponse.ok(service.findAll());
    }
}
