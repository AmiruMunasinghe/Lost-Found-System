package com.uom.lostfound.matching.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class MatchDto {
    private UUID matchId;
    private UUID lostItemId;
    private UUID foundItemId;
    private int confidenceScore;
    private String status;
    private UUID confirmedByUserId;
    private LocalDateTime confirmAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MatchDto() {
    }

    public MatchDto(UUID matchId, UUID lostItemId, UUID foundItemId, int confidenceScore, String status,
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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

    public static MatchDtoBuilder builder() {
        return new MatchDtoBuilder();
    }

    public static class MatchDtoBuilder {
        private UUID matchId;
        private UUID lostItemId;
        private UUID foundItemId;
        private int confidenceScore;
        private String status;
        private UUID confirmedByUserId;
        private LocalDateTime confirmAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public MatchDtoBuilder matchId(UUID matchId) {
            this.matchId = matchId;
            return this;
        }

        public MatchDtoBuilder lostItemId(UUID lostItemId) {
            this.lostItemId = lostItemId;
            return this;
        }

        public MatchDtoBuilder foundItemId(UUID foundItemId) {
            this.foundItemId = foundItemId;
            return this;
        }

        public MatchDtoBuilder confidenceScore(int confidenceScore) {
            this.confidenceScore = confidenceScore;
            return this;
        }

        public MatchDtoBuilder status(String status) {
            this.status = status;
            return this;
        }

        public MatchDtoBuilder confirmedByUserId(UUID confirmedByUserId) {
            this.confirmedByUserId = confirmedByUserId;
            return this;
        }

        public MatchDtoBuilder confirmAt(LocalDateTime confirmAt) {
            this.confirmAt = confirmAt;
            return this;
        }

        public MatchDtoBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public MatchDtoBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public MatchDto build() {
            return new MatchDto(matchId, lostItemId, foundItemId, confidenceScore, status, confirmedByUserId, confirmAt,
                    createdAt, updatedAt);
        }
    }
}
