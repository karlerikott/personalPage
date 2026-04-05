package com.karlerikott.personalpage.controller;

import com.karlerikott.personalpage.domain.Weight;
import com.karlerikott.personalpage.service.WeightService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracker/weight")
@RequiredArgsConstructor
public class WeightController {

    private final WeightService service;

    record WeightRequest(double weightKg) {}

    @PostMapping
    public ApiResponse<Weight> create(@RequestBody WeightRequest request) {
        return ApiResponse.ok(service.save(request.weightKg()));
    }

    @GetMapping
    public ApiResponse<List<Weight>> findAll() {
        return ApiResponse.ok(service.findAll());
    }
}
