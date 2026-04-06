package com.karlerikott.personalpage.mfp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MfpDiaryResponse(
        @JsonProperty("diary_meals") List<MfpMeal> diaryMeals,
        MfpTotals totals
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MfpMeal(
            String name,
            @JsonProperty("diary_meal_foods") List<MfpFood> diaryMealFoods,
            MfpTotals totals
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MfpFood(
            @JsonProperty("display_name") String displayName
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MfpTotals(double calories) {}
}
