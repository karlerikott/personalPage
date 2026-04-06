package com.karlerikott.personalpage.mfp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.karlerikott.personalpage.domain.FoodIntake;
import com.karlerikott.personalpage.repository.FoodIntakeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class MfpService {

    private final FoodIntakeRepository foodIntakeRepository;
    private final ObjectMapper objectMapper;

    @Value("${mfp.username:}")
    private String username;

    @Value("${mfp.password:}")
    private String password;

    /** Raw session cookie string, e.g. "_session_id=abc123". Used when logged in via Google/OAuth. */
    @Value("${mfp.session.cookie:}")
    private String sessionCookie;

    public int syncDays(int days) throws Exception {
        if (username.isBlank()) {
            throw new IllegalStateException("MFP_USERNAME is not set");
        }

        boolean usingSessionCookie = !sessionCookie.isBlank();

        HttpClient client;
        if (usingSessionCookie) {
            // Cookie provided directly — no login needed
            client = HttpClient.newBuilder()
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build();
            log.info("MFP: using provided session cookie for user: {}", username);
        } else {
            // Traditional username/password login
            if (password.isBlank()) {
                throw new IllegalStateException(
                        "No MFP auth configured. Set MFP_SESSION_COOKIE (for Google login) or both MFP_USERNAME and MFP_PASSWORD.");
            }
            CookieManager cookieManager = new CookieManager();
            cookieManager.setCookiePolicy(CookiePolicy.ACCEPT_ALL);
            client = HttpClient.newBuilder()
                    .cookieHandler(cookieManager)
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build();
            login(client);
            log.info("MFP: password login successful for user: {}", username);
        }

        int imported = 0;
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        for (int i = 0; i < days; i++) {
            LocalDate date = today.minusDays(i);
            String dateStr = date.toString(); // YYYY-MM-DD

            if (foodIntakeRepository.existsByMfpId(dateStr)) {
                log.debug("MFP: skipping {} — already imported", dateStr);
                continue;
            }

            try {
                MfpDiaryResponse diary = fetchDiary(client, dateStr, usingSessionCookie ? sessionCookie : null);
                if (diary == null || diary.totals() == null || diary.totals().calories() <= 0) {
                    log.debug("MFP: no data for {}", dateStr);
                    continue;
                }

                int kcal = (int) Math.round(diary.totals().calories());
                String description = buildDescription(diary, dateStr);

                FoodIntake entry = FoodIntake.builder()
                        .kcal(kcal)
                        .description(description)
                        .mfpId(dateStr)
                        .createdAt(date.atStartOfDay(ZoneOffset.UTC).toInstant())
                        .build();

                foodIntakeRepository.save(entry);
                imported++;
                log.debug("MFP: imported {} — {} kcal", dateStr, kcal);
            } catch (Exception e) {
                log.warn("MFP: failed to fetch diary for {} — {}", dateStr, e.getMessage());
            }
        }

        log.info("MFP sync complete: {} days imported", imported);
        return imported;
    }

    private void login(HttpClient client) throws Exception {
        // Step 1: load login page to get CSRF token
        HttpRequest pageRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://www.myfitnesspal.com/"))
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .header("Accept", "text/html,application/xhtml+xml")
                .GET()
                .build();

        HttpResponse<String> pageResponse = client.send(pageRequest, HttpResponse.BodyHandlers.ofString());
        String csrfToken = extractCsrfToken(pageResponse.body());
        log.debug("MFP: extracted CSRF token");

        // Step 2: submit login form
        String formBody = "authenticity_token=" + URLEncoder.encode(csrfToken, StandardCharsets.UTF_8)
                + "&username=" + URLEncoder.encode(username, StandardCharsets.UTF_8)
                + "&password=" + URLEncoder.encode(password, StandardCharsets.UTF_8)
                + "&remember_me=1";

        HttpRequest loginRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://www.myfitnesspal.com/user_sessions"))
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Referer", "https://www.myfitnesspal.com/")
                .POST(HttpRequest.BodyPublishers.ofString(formBody))
                .build();

        HttpResponse<String> loginResponse = client.send(loginRequest, HttpResponse.BodyHandlers.ofString());

        if (loginResponse.uri().toString().contains("user_sessions")
                || loginResponse.body().contains("Incorrect username or password")) {
            throw new IllegalStateException("MFP login failed — check MFP_USERNAME and MFP_PASSWORD");
        }
    }

    /** Public debug method — returns the raw response body for a given date */
    public String fetchRawDiary(String date) throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
        String cookie = sessionCookie.isBlank() ? null : sessionCookie;
        HttpResponse<String> response = buildDiaryRequest(client, date, cookie);
        return "status=" + response.statusCode() + "\n" + response.body();
    }

    private HttpResponse<String> buildDiaryRequest(HttpClient client, String date, String cookieHeader) throws Exception {
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create("https://www.myfitnesspal.com/food/diary/" + username + ".json?date=" + date))
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .header("Accept", "application/json")
                .header("X-Requested-With", "XMLHttpRequest");
        if (cookieHeader != null) {
            requestBuilder.header("Cookie", cookieHeader);
        }
        return client.send(requestBuilder.GET().build(), HttpResponse.BodyHandlers.ofString());
    }

    private MfpDiaryResponse fetchDiary(HttpClient client, String date, String cookieHeader) throws Exception {
        HttpResponse<String> response = buildDiaryRequest(client, date, cookieHeader);

        if (response.statusCode() != 200) {
            log.warn("MFP: diary request returned {} for date {}", response.statusCode(), date);
            return null;
        }

        String body = response.body();
        if (!body.trim().startsWith("{")) {
            log.warn("MFP: diary response is not JSON for {} — session cookie may be expired", date);
            return null;
        }

        return objectMapper.readValue(body, MfpDiaryResponse.class);
    }

    private String extractCsrfToken(String html) {
        Matcher meta = Pattern.compile("name=\"csrf-token\"[^>]+content=\"([^\"]+)\"").matcher(html);
        if (meta.find()) return meta.group(1);

        Matcher meta2 = Pattern.compile("content=\"([^\"]+)\"[^>]+name=\"csrf-token\"").matcher(html);
        if (meta2.find()) return meta2.group(1);

        Matcher input = Pattern.compile("name=\"authenticity_token\"[^>]+value=\"([^\"]+)\"").matcher(html);
        if (input.find()) return input.group(1);

        throw new IllegalStateException("MFP: could not extract CSRF token from login page");
    }

    private String buildDescription(MfpDiaryResponse diary, String date) {
        if (diary.diaryMeals() == null || diary.diaryMeals().isEmpty()) {
            return "MFP — " + date;
        }

        List<String> items = new ArrayList<>();
        for (MfpDiaryResponse.MfpMeal meal : diary.diaryMeals()) {
            if (meal.diaryMealFoods() == null || meal.diaryMealFoods().isEmpty()) continue;
            meal.diaryMealFoods().stream()
                    .findFirst()
                    .map(MfpDiaryResponse.MfpFood::displayName)
                    .ifPresent(items::add);
        }

        if (items.isEmpty()) return "MFP — " + date;
        String preview = String.join(", ", items);
        return preview.length() > 80 ? preview.substring(0, 77) + "…" : preview;
    }
}
