package com.karlerikott.personalpage.strava;

import com.karlerikott.personalpage.domain.Training;
import com.karlerikott.personalpage.domain.TrainingType;
import com.karlerikott.personalpage.repository.TrainingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class StravaService {

    private final TrainingRepository trainingRepository;
    private final RestClient restClient;

    @Value("${strava.client-id:}")
    private String clientId;

    @Value("${strava.client-secret:}")
    private String clientSecret;

    @Value("${strava.refresh-token:}")
    private String refreshToken;

    public StravaService(TrainingRepository trainingRepository, RestClient.Builder restClientBuilder) {
        this.trainingRepository = trainingRepository;
        this.restClient = restClientBuilder.build();
    }

    public StravaTokenResponse exchangeCode(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("code", code);
        form.add("grant_type", "authorization_code");

        return restClient.post()
                .uri("https://www.strava.com/oauth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(StravaTokenResponse.class);
    }

    public String getAccessToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("refresh_token", refreshToken);
        form.add("grant_type", "refresh_token");

        StravaTokenResponse response = restClient.post()
                .uri("https://www.strava.com/oauth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(StravaTokenResponse.class);

        return response.accessToken();
    }

    public int syncActivities() {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalStateException("Strava not connected — STRAVA_REFRESH_TOKEN is not set");
        }

        String accessToken = getAccessToken();
        List<StravaActivitySummary> all = new ArrayList<>();
        int pageNum = 1;

        while (true) {
            List<StravaActivitySummary> batch = restClient.get()
                    .uri("https://www.strava.com/api/v3/athlete/activities?per_page=100&page=" + pageNum)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<StravaActivitySummary>>() {});

            if (batch == null || batch.isEmpty()) break;
            all.addAll(batch);
            if (batch.size() < 100) break;
            pageNum++;
        }

        int imported = 0;
        for (StravaActivitySummary activity : all) {
            if (trainingRepository.existsByStravaId(activity.id())) continue;

            TrainingType type = mapSportType(activity.sportType());
            if (type == null) {
                log.debug("Skipping Strava activity '{}' with unmapped type: {}", activity.name(), activity.sportType());
                continue;
            }

            Training training = Training.builder()
                    .type(type)
                    .description(activity.name())
                    .stravaId(activity.id())
                    .createdAt(Instant.parse(activity.startDate()))
                    .build();
            trainingRepository.save(training);
            imported++;
        }

        log.info("Strava sync complete: {} imported out of {} total activities", imported, all.size());
        return imported;
    }

    private TrainingType mapSportType(String sportType) {
        if (sportType == null) return null;
        return switch (sportType) {
            case "Run", "TrailRun", "VirtualRun" -> TrainingType.RUNNING;
            case "Ride", "VirtualRide", "EBikeRide", "GravelRide", "MountainBikeRide" -> TrainingType.BIKE;
            case "Swim" -> TrainingType.SWIMMING;
            case "WeightTraining", "Workout", "CrossFit", "Elliptical" -> TrainingType.GYM;
            case "Squash", "Tennis", "Racquetball", "Badminton", "Pickleball" -> TrainingType.PADEL;
            default -> null;
        };
    }
}
