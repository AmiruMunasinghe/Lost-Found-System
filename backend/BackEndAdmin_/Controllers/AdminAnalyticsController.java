package uom.msd.lostfound.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import uom.msd.lostfound.auth.AuthenticatedUser;
import uom.msd.lostfound.dto.AnalyticsResponseDTO;
import uom.msd.lostfound.services.AdminAnalyticsService;

/**
 * REST Controller for admin analytics and reporting
 */
@Slf4j
@RestController
@RequestMapping("/admin/analytics")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminAnalyticsController {

    @Autowired
    private AdminAnalyticsService analyticsService;

    /**
     * Get comprehensive claim analytics dashboard
     * GET /admin/analytics?range=7
     * @param range number of days to analyze (default 7)
     */
    @GetMapping
    public ResponseEntity<AnalyticsResponseDTO> getAnalytics(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam(defaultValue = "7") int range) {
        try {
            // Validate range
            if (range < 1 || range > 365) {
                range = 7; // Default to 7 days if invalid
            }

            AnalyticsResponseDTO analytics = analyticsService.getClaimAnalytics(range);
            log.info("Generated analytics for {} days", range);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error generating analytics for range {}", range, e);
            throw e;
        }
    }

    /**
     * Get only summary statistics
     * GET /admin/analytics/summary?range=30
     */
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsResponseDTO.SummaryDTO> getSummary(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam(defaultValue = "7") int range) {
        try {
            if (range < 1 || range > 365) {
                range = 7;
            }

            AnalyticsResponseDTO.SummaryDTO summary = analyticsService.getSummary(range);
            log.info("Generated summary for {} days", range);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error generating summary for range {}", range, e);
            throw e;
        }
    }

    /**
     * Get trend series data
     * GET /admin/analytics/trends?range=30
     */
    @GetMapping("/trends")
    public ResponseEntity<java.util.List<AnalyticsResponseDTO.TrendSeriesDTO>> getTrends(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam(defaultValue = "7") int range) {
        try {
            if (range < 1 || range > 365) {
                range = 7;
            }

            java.util.List<AnalyticsResponseDTO.TrendSeriesDTO> trends = analyticsService.getTrendSeries(range);
            log.info("Generated trends for {} days", range);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            log.error("Error generating trends for range {}", range, e);
            throw e;
        }
    }

    /**
     * Get status breakdown
     * GET /admin/analytics/status-breakdown?range=30
     */
    @GetMapping("/status-breakdown")
    public ResponseEntity<java.util.List<AnalyticsResponseDTO.StatusBreakdownDTO>> getStatusBreakdown(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam(defaultValue = "7") int range) {
        try {
            if (range < 1 || range > 365) {
                range = 7;
            }

            java.util.List<AnalyticsResponseDTO.StatusBreakdownDTO> breakdown = 
                    analyticsService.getStatusBreakdown(range);
            log.info("Generated status breakdown for {} days", range);
            return ResponseEntity.ok(breakdown);
        } catch (Exception e) {
            log.error("Error generating status breakdown for range {}", range, e);
            throw e;
        }
    }

    /**
     * Get category breakdown
     * GET /admin/analytics/category-breakdown?range=30
     */
    @GetMapping("/category-breakdown")
    public ResponseEntity<java.util.List<AnalyticsResponseDTO.CategoryBreakdownDTO>> getCategoryBreakdown(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam(defaultValue = "7") int range) {
        try {
            if (range < 1 || range > 365) {
                range = 7;
            }

            java.util.List<AnalyticsResponseDTO.CategoryBreakdownDTO> breakdown = 
                    analyticsService.getCategoryBreakdown(range);
            log.info("Generated category breakdown for {} days", range);
            return ResponseEntity.ok(breakdown);
        } catch (Exception e) {
            log.error("Error generating category breakdown for range {}", range, e);
            throw e;
        }
    }

    /**
     * Get location breakdown
     * GET /admin/analytics/location-breakdown?range=30
     */
    @GetMapping("/location-breakdown")
    public ResponseEntity<java.util.List<AnalyticsResponseDTO.LocationBreakdownDTO>> getLocationBreakdown(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam(defaultValue = "7") int range) {
        try {
            if (range < 1 || range > 365) {
                range = 7;
            }

            java.util.List<AnalyticsResponseDTO.LocationBreakdownDTO> breakdown = 
                    analyticsService.getLocationBreakdown(range);
            log.info("Generated location breakdown for {} days", range);
            return ResponseEntity.ok(breakdown);
        } catch (Exception e) {
            log.error("Error generating location breakdown for range {}", range, e);
            throw e;
        }
    }
}
