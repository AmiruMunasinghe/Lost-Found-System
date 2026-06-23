package com.uom.lostfound.matching.dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public class ReviewQueueItemDto {
    private UUID reviewId;
    private UUID matchId;
    private double confidenceScore;
    private Map<String, Double> scoreBreakdown;
    private String status;
    private LocalDateTime queuedAt;
    private LocalDateTime resolvedAt;
    private UUID resolvedByAdminId;
    private String resolutionNote;

    public ReviewQueueItemDto() {
    }

    public ReviewQueueItemDto(UUID reviewId, UUID matchId, double confidenceScore, Map<String, Double> scoreBreakdown,
            String status, LocalDateTime queuedAt, LocalDateTime resolvedAt, UUID resolvedByAdminId,
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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

    public static ReviewQueueItemDtoBuilder builder() {
        return new ReviewQueueItemDtoBuilder();
    }

    public static class ReviewQueueItemDtoBuilder {
        private UUID reviewId;
        private UUID matchId;
        private double confidenceScore;
        private Map<String, Double> scoreBreakdown;
        private String status;
        private LocalDateTime queuedAt;
        private LocalDateTime resolvedAt;
        private UUID resolvedByAdminId;
        private String resolutionNote;

        public ReviewQueueItemDtoBuilder reviewId(UUID reviewId) {
            this.reviewId = reviewId;
            return this;
        }

        public ReviewQueueItemDtoBuilder matchId(UUID matchId) {
            this.matchId = matchId;
            return this;
        }

        public ReviewQueueItemDtoBuilder confidenceScore(double confidenceScore) {
            this.confidenceScore = confidenceScore;
            return this;
        }

        public ReviewQueueItemDtoBuilder scoreBreakdown(Map<String, Double> scoreBreakdown) {
            this.scoreBreakdown = scoreBreakdown;
            return this;
        }

        public ReviewQueueItemDtoBuilder status(String status) {
            this.status = status;
            return this;
        }

        public ReviewQueueItemDtoBuilder queuedAt(LocalDateTime queuedAt) {
            this.queuedAt = queuedAt;
            return this;
        }

        public ReviewQueueItemDtoBuilder resolvedAt(LocalDateTime resolvedAt) {
            this.resolvedAt = resolvedAt;
            return this;
        }

        public ReviewQueueItemDtoBuilder resolvedByAdminId(UUID resolvedByAdminId) {
            this.resolvedByAdminId = resolvedByAdminId;
            return this;
        }

        public ReviewQueueItemDtoBuilder resolutionNote(String resolutionNote) {
            this.resolutionNote = resolutionNote;
            return this;
        }

        public ReviewQueueItemDto build() {
            return new ReviewQueueItemDto(reviewId, matchId, confidenceScore, scoreBreakdown, status, queuedAt,
                    resolvedAt, resolvedByAdminId, resolutionNote);
        }
    }
}
