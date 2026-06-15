package com.uom.lostfound.matching.service;

import com.uom.lostfound.matching.algorithm.SimilarityScorer;
import com.uom.lostfound.matching.dto.*;
import com.uom.lostfound.matching.exception.MatchingException;
import com.uom.lostfound.matching.model.*;
import com.uom.lostfound.matching.repository.*;
import com.uom.lostfound.matching.queue.MatchEventPublisher;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Core Matching Engine Service (Team 3)
 *
 * Orchestrates the lost ↔ found item similarity scoring pipeline:
 * 1. Candidate retrieval (category + date window filter)
 * 2. Multi-factor similarity scoring (text, location, image, proximity)
 * 3. Confidence thresholding and ranking
 * 4. Manual review queue routing for borderline matches
 * 5. Event publishing to Notification service (Team 8)
 */
@Service
@RequiredArgsConstructor
public class MatchingEngineService {

    private static final Logger log = LoggerFactory.getLogger(MatchingEngineService.class);

    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final MatchRepository matchRepository;
    private final ManualReviewQueueRepository reviewQueueRepository;
    private final SimilarityScorer similarityScorer;
    private final MatchEventPublisher eventPublisher;

    /**
     * AUTO_APPROVE threshold: matches scoring >= this value are confirmed
     * automatically.
     * Configurable via application.yml so it can be tuned without a redeploy.
     */
    @Value("${matching.threshold.auto-approve:75}")
    private double autoApproveThreshold;

    /**
     * MANUAL_REVIEW band: scores in [manualReviewLow, autoApproveThreshold) go to
     * the queue.
     * Scores below manualReviewLow are silently discarded.
     */
    @Value("${matching.threshold.manual-review-low:45}")
    private double manualReviewLowThreshold;

    /** Maximum number of ranked candidates to return per query. */
    @Value("${matching.max-candidates:10}")
    private int maxCandidates;

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Entry point called by Item & Report Service (Team 5) after a new lost item is
     * saved.
     * Runs the full matching pipeline against all active found items.
     */
    @Transactional
    public MatchingResultDto triggerMatchingForLostItem(UUID lostItemId) {
        log.info("[MatchingEngine] Triggered for lostItemId={}", lostItemId);

        LostItem lostItem = lostItemRepository.findById(lostItemId)
                .orElseThrow(() -> new MatchingException("LostItem not found: " + lostItemId));

        List<FoundItem> candidates = foundItemRepository
                .findActiveCandidates(lostItem.getCategory(), lostItem.getDateLost());

        log.debug("[MatchingEngine] {} candidate(s) found for lostItemId={}", candidates.size(), lostItemId);

        List<ScoredCandidate> scored = scoreAndRank(lostItem, candidates);
        List<MatchDto> results = processResults(lostItem, scored);

        return MatchingResultDto.builder()
                .lostItemId(lostItemId)
                .totalCandidatesEvaluated(candidates.size())
                .matchesCreated(results.size())
                .matches(results)
                .build();
    }

    /**
     * Entry point called after a new found item is saved.
     * Runs matching in reverse: one found item vs all active lost items.
     */
    @Transactional
    public MatchingResultDto triggerMatchingForFoundItem(UUID foundItemId) {
        log.info("[MatchingEngine] Triggered for foundItemId={}", foundItemId);

        FoundItem foundItem = foundItemRepository.findById(foundItemId)
                .orElseThrow(() -> new MatchingException("FoundItem not found: " + foundItemId));

        List<LostItem> candidates = lostItemRepository
                .findActiveCandidates(foundItem.getCategory(), foundItem.getDateFound());

        List<ScoredCandidate> scored = scoreAndRankReverse(foundItem, candidates);
        List<MatchDto> results = processResultsReverse(foundItem, scored);

        return MatchingResultDto.builder()
                .foundItemId(foundItemId)
                .totalCandidatesEvaluated(candidates.size())
                .matchesCreated(results.size())
                .matches(results)
                .build();
    }

    /**
     * On-demand re-scoring for a specific lost ↔ found pair.
     * Useful when an admin updates item details.
     */
    @Transactional
    public MatchDto recalculateMatch(UUID lostItemId, UUID foundItemId) {
        LostItem lost = lostItemRepository.findById(lostItemId)
                .orElseThrow(() -> new MatchingException("LostItem not found: " + lostItemId));
        FoundItem found = foundItemRepository.findById(foundItemId)
                .orElseThrow(() -> new MatchingException("FoundItem not found: " + foundItemId));

        ScoredCandidate scored = similarityScorer.score(lost, found);
        Match match = upsertMatch(lost, found, scored.getConfidenceScore());
        return toDto(match);
    }

    /**
     * Returns the top-N ranked potential matches for a given lost item.
     */
    public List<MatchDto> getMatchesForLostItem(UUID lostItemId, int limit) {
        return matchRepository
                .findByLostItemIdOrderByConfidenceScoreDesc(lostItemId, limit)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Returns the top-N ranked potential matches for a given found item.
     */
    public List<MatchDto> getMatchesForFoundItem(UUID foundItemId, int limit) {
        return matchRepository
                .findByFoundItemIdOrderByConfidenceScoreDesc(foundItemId, limit)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single match by ID.
     */
    public Optional<MatchDto> getMatchById(UUID matchId) {
        return matchRepository.findById(matchId).map(this::toDto);
    }

    /**
     * Confirms a match (called by user claim flow, Team 5).
     * Publishes MATCH_CONFIRMED event to Notification service (Team 8).
     */
    @Transactional
    public MatchDto confirmMatch(UUID matchId, UUID confirmedByUserId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new MatchingException("Match not found: " + matchId));

        match.setStatus(MatchStatus.CONFIRMED);
        match.setConfirmedByUserId(confirmedByUserId);
        match.setConfirmAt(LocalDateTime.now());
        matchRepository.save(match);

        eventPublisher.publishMatchConfirmed(match);
        log.info("[MatchingEngine] Match CONFIRMED matchId={} by userId={}", matchId, confirmedByUserId);
        return toDto(match);
    }

    /**
     * Rejects a match (called by admin or user dispute flow).
     */
    @Transactional
    public MatchDto rejectMatch(UUID matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new MatchingException("Match not found: " + matchId));

        match.setStatus(MatchStatus.REJECTED);
        matchRepository.save(match);

        log.info("[MatchingEngine] Match REJECTED matchId={}", matchId);
        return toDto(match);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE PIPELINE METHODS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Scores every (lostItem, foundItem) pair using SimilarityScorer and sorts
     * descending.
     */
    private List<ScoredCandidate> scoreAndRank(LostItem lostItem, List<FoundItem> candidates) {
        return candidates.parallelStream()
                .map(found -> similarityScorer.score(lostItem, found))
                .filter(sc -> sc.getConfidenceScore() >= manualReviewLowThreshold)
                .sorted(Comparator.comparingDouble(ScoredCandidate::getConfidenceScore).reversed())
                .limit(maxCandidates)
                .collect(Collectors.toList());
    }

    private List<ScoredCandidate> scoreAndRankReverse(FoundItem foundItem, List<LostItem> candidates) {
        return candidates.parallelStream()
                .map(lost -> similarityScorer.scoreReverse(lost, foundItem))
                .filter(sc -> sc.getConfidenceScore() >= manualReviewLowThreshold)
                .sorted(Comparator.comparingDouble(ScoredCandidate::getConfidenceScore).reversed())
                .limit(maxCandidates)
                .collect(Collectors.toList());
    }

    /**
     * Persists matches, routes to manual review queue or auto-approves, publishes
     * events.
     */
    private List<MatchDto> processResults(LostItem lostItem, List<ScoredCandidate> scored) {
        List<MatchDto> dtos = new ArrayList<>();
        for (ScoredCandidate sc : scored) {
            FoundItem found = (FoundItem) sc.getCounterpart();
            Match match = upsertMatch(lostItem, found, sc.getConfidenceScore());
            routeMatch(match, sc);
            dtos.add(toDto(match));
        }
        return dtos;
    }

    private List<MatchDto> processResultsReverse(FoundItem foundItem, List<ScoredCandidate> scored) {
        List<MatchDto> dtos = new ArrayList<>();
        for (ScoredCandidate sc : scored) {
            LostItem lost = (LostItem) sc.getCounterpart();
            Match match = upsertMatch(lost, foundItem, sc.getConfidenceScore());
            routeMatch(match, sc);
            dtos.add(toDto(match));
        }
        return dtos;
    }

    /**
     * Threshold-based routing:
     * >= autoApproveThreshold → PENDING (notify user immediately)
     * [manualReviewLow, auto) → PENDING + queued for manual review
     */
    private void routeMatch(Match match, ScoredCandidate sc) {
        if (sc.getConfidenceScore() >= autoApproveThreshold) {
            match.setStatus(MatchStatus.PENDING);
            matchRepository.save(match);
            eventPublisher.publishHighConfidenceMatch(match);
            log.info("[MatchingEngine] HIGH-CONFIDENCE match created matchId={} score={}",
                    match.getMatchId(), sc.getConfidenceScore());
        } else {
            // Borderline: add to manual review queue (Admin dashboard, Team 7)
            match.setStatus(MatchStatus.PENDING);
            matchRepository.save(match);
            enqueueForManualReview(match, sc);
            log.info("[MatchingEngine] MANUAL-REVIEW queued matchId={} score={}",
                    match.getMatchId(), sc.getConfidenceScore());
        }
    }

    private void enqueueForManualReview(Match match, ScoredCandidate sc) {
        ManualReviewEntry entry = ManualReviewEntry.builder()
                .matchId(match.getMatchId())
                .confidenceScore(sc.getConfidenceScore())
                .scoreBreakdown(sc.getScoreBreakdown())
                .queuedAt(LocalDateTime.now())
                .status(ReviewStatus.PENDING)
                .build();
        reviewQueueRepository.save(entry);
        eventPublisher.publishManualReviewQueued(match);
    }

    private Match upsertMatch(LostItem lost, FoundItem found, double score) {
        return matchRepository
                .findByLostItemIdAndFoundItemId(lost.getLostItemId(), found.getFoundItemId())
                .map(existing -> {
                    existing.setConfidenceScore((int) Math.round(score));
                    existing.setUpdatedAt(LocalDateTime.now());
                    return matchRepository.save(existing);
                })
                .orElseGet(() -> {
                    Match m = Match.builder()
                            .matchId(UUID.randomUUID())
                            .lostItemId(lost.getLostItemId())
                            .foundItemId(found.getFoundItemId())
                            .confidenceScore((int) Math.round(score))
                            .status(MatchStatus.PENDING)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return matchRepository.save(m);
                });
    }

    private MatchDto toDto(Match m) {
        return MatchDto.builder()
                .matchId(m.getMatchId())
                .lostItemId(m.getLostItemId())
                .foundItemId(m.getFoundItemId())
                .confidenceScore(m.getConfidenceScore())
                .status(m.getStatus().name())
                .confirmedByUserId(m.getConfirmedByUserId())
                .confirmAt(m.getConfirmAt())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
