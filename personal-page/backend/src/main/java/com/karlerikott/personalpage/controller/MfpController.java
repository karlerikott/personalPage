package com.karlerikott.personalpage.controller;

import com.karlerikott.personalpage.mfp.MfpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
