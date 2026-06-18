package com.uom.lostfound.matching.service;

import com.uom.lostfound.matching.dto.ResolveReviewRequest;
import com.uom.lostfound.matching.dto.ReviewQueueItemDto;
import com.uom.lostfound.matching.model.*;
import com.uom.lostfound.matching.repository.*;
import com.uom.lostfound.matching.queue.MatchEventPublisher;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Manual Review Queue Service (Team 3)
 *
 * Handles the admin review workflow for borderline matches.
 * Admins see these in the Admin Dashboard (Team 7 / Team 9).
 */
@Service
@RequiredArgsConstructor
public class ManualReviewQueueService {

    private static final Logger log = LoggerFactory.getLogger(ManualReviewQueueService.class);

    private final ManualReviewQueueRepository reviewQueueRepository;
    private final MatchRepository matchRepository;
    private final MatchEventPublisher eventPublisher;

    /** Returns paginated list of PENDING review entries for the admin queue. */
    public Page<ReviewQueueItemDto> getPendingQueue(Pageable pageable) {
        return reviewQueueRepository
                .findByStatusOrderByQueuedAtAsc(ReviewStatus.PENDING, pageable)
                .map(this::toDto);
    }

    /**
     * Admin approves or rejects a queued match.
     * On APPROVED: updates Match status to PENDING (notifiable), publishes event.
     * On REJECTED: updates Match status to REJECTED.
     */
    @Transactional
    public ReviewQueueItemDto resolveReview(UUID matchId, ResolveReviewRequest request) {
        ManualReviewEntry entry = reviewQueueRepository.findByMatchId(matchId)
                .orElseThrow(() -> new MatchingException("Review entry not found for matchId: " + matchId));

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new MatchingException("Match not found: " + matchId));

        ReviewStatus resolution = ReviewStatus.valueOf(request.getResolution().toUpperCase());

        if (resolution == ReviewStatus.APPROVED) {
            match.setStatus(MatchStatus.PENDING);
            matchRepository.save(match);
            eventPublisher.publishHighConfidenceMatch(match); // notify users
            log.info("[ReviewQueue] APPROVED matchId={} by adminId={}", matchId, request.getAdminId());
        } else if (resolution == ReviewStatus.REJECTED) {
            match.setStatus(MatchStatus.REJECTED);
            matchRepository.save(match);
            log.info("[ReviewQueue] REJECTED matchId={} by adminId={}", matchId, request.getAdminId());
        }

        entry.setStatus(resolution);
        entry.setResolvedAt(LocalDateTime.now());
        entry.setResolvedByAdminId(request.getAdminId());
        entry.setResolutionNote(request.getNote());
        reviewQueueRepository.save(entry);

        return toDto(entry);
    }

    private ReviewQueueItemDto toDto(ManualReviewEntry e) {
        return ReviewQueueItemDto.builder()
                .reviewId(e.getReviewId())
                .matchId(e.getMatchId())
                .confidenceScore(e.getConfidenceScore())
                .scoreBreakdown(e.getScoreBreakdown())
                .status(e.getStatus().name())
                .queuedAt(e.getQueuedAt())
                .resolvedAt(e.getResolvedAt())
                .resolvedByAdminId(e.getResolvedByAdminId())
                .resolutionNote(e.getResolutionNote())
                .build();
    }
}
