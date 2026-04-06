package com.karlerikott.personalpage.controller;

import com.karlerikott.personalpage.mfp.MfpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/mfp")
@RequiredArgsConstructor
public class MfpController {

    private final MfpService mfpService;

    /**
     * Syncs the last N days from MFP (default 30).
     * POST /api/mfp/sync?days=30
     */
    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> sync(
            @RequestParam(defaultValue = "30") int days) {
        try {
            int imported = mfpService.syncDays(days);
            return ResponseEntity.ok(ApiResponse.ok(Map.of("imported", imported)));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("MFP sync failed: " + e.getMessage()));
        }
    }

    /**
     * Debug endpoint — fetches today's raw diary response so you can see what MFP returns.
     * GET /api/mfp/test
     */
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> test() {
        try {
            String today = LocalDate.now().toString();
            String raw = mfpService.fetchRawDiary(today);
            boolean isJson = raw != null && raw.trim().startsWith("{");
            return ResponseEntity.ok(ApiResponse.ok(Map.of(
                    "date", today,
                    "isJson", isJson,
                    "preview", raw != null ? raw.substring(0, Math.min(500, raw.length())) : "null"
            )));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Test failed: " + e.getMessage()));
        }
    }
}
