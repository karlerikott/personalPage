package com.karlerikott.personalpage.controller;

import com.karlerikott.personalpage.domain.FoodIntake;
import com.karlerikott.personalpage.service.FoodIntakeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracker/food")
@RequiredArgsConstructor
public class FoodIntakeController {

    private final FoodIntakeService service;

    record FoodIntakeRequest(
            @Min(value = 1, message = "kcal must be at least 1")
            @Max(value = 10000, message = "kcal must be at most 10000")
            int kcal,
            @NotBlank(message = "description must not be blank")
            String description
    ) {}

    @PostMapping
    public ApiResponse<FoodIntake> create(@Valid @RequestBody FoodIntakeRequest request) {
        return ApiResponse.ok(service.save(request.kcal(), request.description()));
    }

    @GetMapping
    public ApiResponse<List<FoodIntake>> findAll() {
        return ApiResponse.ok(service.findAll());
    }
}
