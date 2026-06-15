package com.uom.lostfound.matching.controller;

import com.uom.lostfound.matching.dto.*;
import com.uom.lostfound.matching.exception.MatchNotFoundException;
import com.uom.lostfound.matching.service.MatchingEngineService;
import com.uom.lostfound.matching.service.ManualReviewQueueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Matching Engine REST Controller (Team 3)
 *
 * Base path: /api/v1/matches
 *
 * Exposes:
 * - POST /trigger/lost/{lostItemId} → run matching for a lost item
 * - POST /trigger/found/{foundItemId} → run matching for a found item
 * - POST /recalculate → on-demand re-score a pair
 * - GET /lost/{lostItemId} → top matches for lost item
 * - GET /found/{foundItemId} → top matches for found item
 * - GET /{matchId} → single match detail
 * - POST /{matchId}/confirm → user/admin confirms a match
 * - POST /{matchId}/reject → reject a match
 * - GET /queue → manual review queue (ADMIN)
 * - POST /queue/{matchId}/resolve → resolve queued review (ADMIN)
 */
@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
@Tag(name = "Matching Engine", description = "Lost ↔ Found similarity scoring, confidence ranking, and review queue")
public class MatchController {

    private final MatchingEngineService matchingEngineService;
    private final ManualReviewQueueService reviewQueueService;

    // ─────────────────────────────────────────────────────────────────────────
    // TRIGGER ENDPOINTS (called internally by Item Service, Team 5)
    // ─────────────────────────────────────────────────────────────────────────

    @Operation(summary = "Trigger matching pipeline for a newly reported lost item")
    @PostMapping("/trigger/lost/{lostItemId}")
    @PreAuthorize("hasRole('INTERNAL') or hasRole('ADMIN')")
    public ResponseEntity<MatchingResultDto> triggerForLostItem(@PathVariable UUID lostItemId) {
        MatchingResultDto result = matchingEngineService.triggerMatchingForLostItem(lostItemId);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Trigger matching pipeline for a newly registered found item")
    @PostMapping("/trigger/found/{foundItemId}")
    @PreAuthorize("hasRole('INTERNAL') or hasRole('ADMIN')")
    public ResponseEntity<MatchingResultDto> triggerForFoundItem(@PathVariable UUID foundItemId) {
        MatchingResultDto result = matchingEngineService.triggerMatchingForFoundItem(foundItemId);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "On-demand re-score a specific lost ↔ found pair")
    @PostMapping("/recalculate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchDto> recalculate(@Valid @RequestBody RecalculateRequest request) {
        MatchDto match = matchingEngineService.recalculateMatch(
                request.getLostItemId(), request.getFoundItemId());
        return ResponseEntity.ok(match);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    @Operation(summary = "Get top-N ranked matches for a lost item")
    @GetMapping("/lost/{lostItemId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<MatchDto>> getMatchesForLostItem(
            @PathVariable UUID lostItemId,
            @RequestParam(defaultValue = "5") @Min(1) @Max(20) int limit) {
        return ResponseEntity.ok(matchingEngineService.getMatchesForLostItem(lostItemId, limit));
    }

    @Operation(summary = "Get top-N ranked matches for a found item")
    @GetMapping("/found/{foundItemId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<MatchDto>> getMatchesForFoundItem(
            @PathVariable UUID foundItemId,
            @RequestParam(defaultValue = "5") @Min(1) @Max(20) int limit) {
        return ResponseEntity.ok(matchingEngineService.getMatchesForFoundItem(foundItemId, limit));
    }

    @Operation(summary = "Get a single match by ID")
    @GetMapping("/{matchId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<MatchDto> getMatch(@PathVariable UUID matchId) {
        MatchDto match = matchingEngineService.getMatchById(matchId)
                .orElseThrow(() -> new MatchNotFoundException(matchId));
        return ResponseEntity.ok(match);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MATCH LIFECYCLE
    // ─────────────────────────────────────────────────────────────────────────

    @Operation(summary = "Confirm a match (user claim confirmation)")
    @PostMapping("/{matchId}/confirm")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<MatchDto> confirmMatch(
            @PathVariable UUID matchId,
            @Valid @RequestBody ConfirmMatchRequest request) {
        MatchDto updated = matchingEngineService.confirmMatch(matchId, request.getConfirmedByUserId());
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Reject a match")
    @PostMapping("/{matchId}/reject")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<MatchDto> rejectMatch(@PathVariable UUID matchId) {
        MatchDto updated = matchingEngineService.rejectMatch(matchId);
        return ResponseEntity.ok(updated);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MANUAL REVIEW QUEUE API (consumed by Admin Dashboard, Team 7 / Team 9)
    // ─────────────────────────────────────────────────────────────────────────

    @Operation(summary = "List all pending manual review entries (ADMIN only)")
    @GetMapping("/queue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReviewQueueItemDto>> getReviewQueue(
            @PageableDefault(size = 20, sort = "queuedAt") Pageable pageable) {
        return ResponseEntity.ok(reviewQueueService.getPendingQueue(pageable));
    }

    @Operation(summary = "Admin resolves a manual review entry: approve or reject")
    @PostMapping("/queue/{matchId}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewQueueItemDto> resolveReview(
            @PathVariable UUID matchId,
            @Valid @RequestBody ResolveReviewRequest request) {
        ReviewQueueItemDto resolved = reviewQueueService.resolveReview(matchId, request);
        return ResponseEntity.ok(resolved);
    }
}
