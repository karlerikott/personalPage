package com.karlerikott.personalpage.controller;

import com.karlerikott.personalpage.strava.StravaService;
import com.karlerikott.personalpage.strava.StravaTokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/strava")
@RequiredArgsConstructor
public class StravaController {

    private final StravaService stravaService;

    @Value("${strava.client-id:}")
    private String clientId;

    /** Step 1 — visit this URL to kick off the OAuth flow */
    @GetMapping("/authorize")
    public ResponseEntity<Void> authorize() {
        String url = "https://www.strava.com/oauth/authorize"
                + "?client_id=" + clientId
                + "&response_type=code"
                + "&redirect_uri=https://personalpage-production-b21f.up.railway.app/api/strava/callback"
                + "&approval_prompt=force"
                + "&scope=activity:read_all";
        return ResponseEntity.status(302).location(URI.create(url)).build();
    }

    /** Step 2 — Strava redirects here with a one-time code; we exchange it for tokens */
    @GetMapping("/callback")
    public ResponseEntity<String> callback(@RequestParam String code) {
        StravaTokenResponse tokens = stravaService.exchangeCode(code);
        String html = """
                <!DOCTYPE html>
                <html>
                <body style="font-family:monospace;background:#0a0a0a;color:white;padding:2rem;max-width:600px;margin:0 auto">
                  <h2 style="color:#10b981">Strava connected!</h2>
                  <p style="color:#999">Add the value below as <strong>STRAVA_REFRESH_TOKEN</strong> in Railway, then redeploy.</p>
                  <pre style="background:#1a1a1a;padding:1rem;border-radius:8px;word-break:break-all;color:#10b981">%s</pre>
                  <p style="color:#555;font-size:0.85rem">You can close this page once saved.</p>
                </body>
                </html>
                """.formatted(tokens.refreshToken());
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    /** Sync Strava activities into the training table */
    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> sync() {
        try {
            int imported = stravaService.syncActivities();
            return ResponseEntity.ok(ApiResponse.ok(Map.of("imported", imported)));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Sync failed: " + e.getMessage()));
        }
    }
}
