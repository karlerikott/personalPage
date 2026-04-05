package com.karlerikott.personalpage.controller;

import com.karlerikott.personalpage.domain.FoodIntake;
import com.karlerikott.personalpage.service.FoodIntakeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracker/food")
@RequiredArgsConstructor
public class FoodIntakeController {

    private final FoodIntakeService service;

    record FoodIntakeRequest(int kcal, String description) {}

    @PostMapping
    public ApiResponse<FoodIntake> create(@RequestBody FoodIntakeRequest request) {
        return ApiResponse.ok(service.save(request.kcal(), request.description()));
    }

    @GetMapping
    public ApiResponse<List<FoodIntake>> findAll() {
        return ApiResponse.ok(service.findAll());
    }
}
