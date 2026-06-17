package com.uom.lostfound.matching.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Match entity – represents a scored lost ↔ found item pair.
 *
 * Status lifecycle:
 * PENDING → CONFIRMED (user confirms ownership)
 * PENDING → REJECTED (user/admin rejects)
 */
@Entity
@Table(name = "match", uniqueConstraints = @UniqueConstraint(name = "uq_match_lost_found", columnNames = {
        "lost_item_id", "found_item_id" }), indexes = {
                @Index(name = "idx_match_lost_item", columnList = "lost_item_id"),
                @Index(name = "idx_match_found_item", columnList = "found_item_id"),
                @Index(name = "idx_match_score", columnList = "confidence_score DESC"),
                @Index(name = "idx_match_status", columnList = "status")
        })
public class Match {

    @Id
    @UuidGenerator
    @Column(name = "match_id", updatable = false, nullable = false)
    private UUID matchId;

    /** FK → lost_item.lost_item_id (no JPA relation – cross-service boundary) */
    @Column(name = "lost_item_id", nullable = false)
    private UUID lostItemId;

    /** FK → found_item.found_item_id */
    @Column(name = "found_item_id", nullable = false)
    private UUID foundItemId;

    /**
     * Composite confidence score in range [0, 100].
     * SMALLINT is sufficient and saves storage vs INT.
     */
    @Column(name = "confidence_score", nullable = false, columnDefinition = "SMALLINT")
    private int confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MatchStatus status;

    /** Populated when a user or admin confirms the match. */
    @Column(name = "confirmed_by_user_id")
    private UUID confirmedByUserId;

    @Column(name = "confirm_at")
    private LocalDateTime confirmAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Match() {
    }

    public Match(UUID matchId, UUID lostItemId, UUID foundItemId, int confidenceScore, MatchStatus status,
            UUID confirmedByUserId, LocalDateTime confirmAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.matchId = matchId;
        this.lostItemId = lostItemId;
        this.foundItemId = foundItemId;
        this.confidenceScore = confidenceScore;
        this.status = status;
        this.confirmedByUserId = confirmedByUserId;
        this.confirmAt = confirmAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getMatchId() {
        return matchId;
    }

    public void setMatchId(UUID matchId) {
        this.matchId = matchId;
    }

    public UUID getLostItemId() {
        return lostItemId;
    }

    public void setLostItemId(UUID lostItemId) {
        this.lostItemId = lostItemId;
    }

    public UUID getFoundItemId() {
        return foundItemId;
    }

    public void setFoundItemId(UUID foundItemId) {
        this.foundItemId = foundItemId;
    }

    public int getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(int confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public MatchStatus getStatus() {
        return status;
    }

    public void setStatus(MatchStatus status) {
        this.status = status;
    }

    public UUID getConfirmedByUserId() {
        return confirmedByUserId;
    }

    public void setConfirmedByUserId(UUID confirmedByUserId) {
        this.confirmedByUserId = confirmedByUserId;
    }

    public LocalDateTime getConfirmAt() {
        return confirmAt;
    }

    public void setConfirmAt(LocalDateTime confirmAt) {
        this.confirmAt = confirmAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null)
            createdAt = LocalDateTime.now();
        if (updatedAt == null)
            updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static MatchBuilder builder() {
        return new MatchBuilder();
    }

    public static class MatchBuilder {
        private UUID matchId;
        private UUID lostItemId;
        private UUID foundItemId;
        private int confidenceScore;
        private MatchStatus status;
        private UUID confirmedByUserId;
        private LocalDateTime confirmAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public MatchBuilder matchId(UUID matchId) {
            this.matchId = matchId;
            return this;
        }

        public MatchBuilder lostItemId(UUID lostItemId) {
            this.lostItemId = lostItemId;
            return this;
        }

        public MatchBuilder foundItemId(UUID foundItemId) {
            this.foundItemId = foundItemId;
            return this;
        }

        public MatchBuilder confidenceScore(int confidenceScore) {
            this.confidenceScore = confidenceScore;
            return this;
        }

        public MatchBuilder status(MatchStatus status) {
            this.status = status;
            return this;
        }

        public MatchBuilder confirmedByUserId(UUID confirmedByUserId) {
            this.confirmedByUserId = confirmedByUserId;
            return this;
        }

        public MatchBuilder confirmAt(LocalDateTime confirmAt) {
            this.confirmAt = confirmAt;
            return this;
        }

        public MatchBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public MatchBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Match build() {
            return new Match(matchId, lostItemId, foundItemId, confidenceScore, status, confirmedByUserId, confirmAt,
                    createdAt, updatedAt);
        }
    }
}
