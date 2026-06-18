package com.uom.lostfound.matching.model;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Persists borderline matches that fall between manualReviewLow and
 * autoApproveThreshold.
 * An admin reviews these via the Admin Dashboard (Team 7 / Team 9).
 */
@Entity
@Table(name = "manual_review_queue", indexes = {
        @Index(name = "idx_mrq_status", columnList = "status"),
        @Index(name = "idx_mrq_queued_at", columnList = "queued_at")
})
public class ManualReviewEntry {

    @Id
    @UuidGenerator
    @Column(name = "review_id", updatable = false, nullable = false)
    private UUID reviewId;

    @Column(name = "match_id", nullable = false, unique = true)
    private UUID matchId;

    @Column(name = "confidence_score", nullable = false)
    private double confidenceScore;

    /**
     * JSON blob storing individual signal scores for admin transparency:
     * { "textScore": 61.3, "locationScore": 40.0, "temporalScore": 80.0,
     * "categoryScore": 100.0 }
     */
    @Type(JsonType.class)
    @Column(name = "score_breakdown", columnDefinition = "jsonb")
    private Map<String, Double> scoreBreakdown;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReviewStatus status;

    @Column(name = "queued_at", nullable = false)
    private LocalDateTime queuedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by_admin_id")
    private UUID resolvedByAdminId;

    /** Admin note explaining approve/reject decision. */
    @Column(name = "resolution_note", columnDefinition = "TEXT")
    private String resolutionNote;

    public ManualReviewEntry() {
    }

    public ManualReviewEntry(UUID reviewId, UUID matchId, double confidenceScore, Map<String, Double> scoreBreakdown,
            ReviewStatus status, LocalDateTime queuedAt, LocalDateTime resolvedAt, UUID resolvedByAdminId,
            String resolutionNote) {
        this.reviewId = reviewId;
        this.matchId = matchId;
        this.confidenceScore = confidenceScore;
        this.scoreBreakdown = scoreBreakdown;
        this.status = status;
        this.queuedAt = queuedAt;
        this.resolvedAt = resolvedAt;
        this.resolvedByAdminId = resolvedByAdminId;
        this.resolutionNote = resolutionNote;
    }

    public UUID getReviewId() {
        return reviewId;
    }

    public void setReviewId(UUID reviewId) {
        this.reviewId = reviewId;
    }

    public UUID getMatchId() {
        return matchId;
    }

    public void setMatchId(UUID matchId) {
        this.matchId = matchId;
    }

    public double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public Map<String, Double> getScoreBreakdown() {
        return scoreBreakdown;
    }

    public void setScoreBreakdown(Map<String, Double> scoreBreakdown) {
        this.scoreBreakdown = scoreBreakdown;
    }

    public ReviewStatus getStatus() {
        return status;
    }

    public void setStatus(ReviewStatus status) {
        this.status = status;
    }

    public LocalDateTime getQueuedAt() {
        return queuedAt;
    }

    public void setQueuedAt(LocalDateTime queuedAt) {
        this.queuedAt = queuedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public UUID getResolvedByAdminId() {
        return resolvedByAdminId;
    }

    public void setResolvedByAdminId(UUID resolvedByAdminId) {
        this.resolvedByAdminId = resolvedByAdminId;
    }

    public String getResolutionNote() {
        return resolutionNote;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote;
    }

    public static ManualReviewEntryBuilder builder() {
        return new ManualReviewEntryBuilder();
    }

    public static class ManualReviewEntryBuilder {
        private UUID reviewId;
        private UUID matchId;
        private double confidenceScore;
        private Map<String, Double> scoreBreakdown;
        private ReviewStatus status;
        private LocalDateTime queuedAt;
        private LocalDateTime resolvedAt;
        private UUID resolvedByAdminId;
        private String resolutionNote;

        public ManualReviewEntryBuilder reviewId(UUID reviewId) {
            this.reviewId = reviewId;
            return this;
        }

        public ManualReviewEntryBuilder matchId(UUID matchId) {
            this.matchId = matchId;
            return this;
        }

        public ManualReviewEntryBuilder confidenceScore(double confidenceScore) {
            this.confidenceScore = confidenceScore;
            return this;
        }

        public ManualReviewEntryBuilder scoreBreakdown(Map<String, Double> scoreBreakdown) {
            this.scoreBreakdown = scoreBreakdown;
            return this;
        }

        public ManualReviewEntryBuilder status(ReviewStatus status) {
            this.status = status;
            return this;
        }

        public ManualReviewEntryBuilder queuedAt(LocalDateTime queuedAt) {
            this.queuedAt = queuedAt;
            return this;
        }

        public ManualReviewEntryBuilder resolvedAt(LocalDateTime resolvedAt) {
            this.resolvedAt = resolvedAt;
            return this;
        }

        public ManualReviewEntryBuilder resolvedByAdminId(UUID resolvedByAdminId) {
            this.resolvedByAdminId = resolvedByAdminId;
            return this;
        }

        public ManualReviewEntryBuilder resolutionNote(String resolutionNote) {
            this.resolutionNote = resolutionNote;
            return this;
        }

        public ManualReviewEntry build() {
            return new ManualReviewEntry(reviewId, matchId, confidenceScore, scoreBreakdown, status, queuedAt,
                    resolvedAt, resolvedByAdminId, resolutionNote);
        }
    }
}
