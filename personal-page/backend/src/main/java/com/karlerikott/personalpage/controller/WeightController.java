package com.karlerikott.personalpage.controller;

import com.karlerikott.personalpage.domain.Weight;
import com.karlerikott.personalpage.service.WeightService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracker/weight")
@RequiredArgsConstructor
public class WeightController {

    private final WeightService service;

    record WeightRequest(
            @DecimalMin(value = "10.0", message = "weight must be at least 10 kg")
            @DecimalMax(value = "500.0", message = "weight must be at most 500 kg")
            double weightKg
    ) {}

    @PostMapping
    public ApiResponse<Weight> create(@Valid @RequestBody WeightRequest request) {
        return ApiResponse.ok(service.save(request.weightKg()));
    }

    @GetMapping
    public ApiResponse<List<Weight>> findAll() {
        return ApiResponse.ok(service.findAll());
    }
}
