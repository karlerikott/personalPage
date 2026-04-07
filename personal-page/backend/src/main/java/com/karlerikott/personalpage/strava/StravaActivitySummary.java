package com.karlerikott.personalpage.strava;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StravaActivitySummary(
        long id,
        String name,
        @JsonProperty("sport_type") String sportType,
        @JsonProperty("start_date") String startDate,
        @JsonProperty("moving_time") int movingTime
) {}
