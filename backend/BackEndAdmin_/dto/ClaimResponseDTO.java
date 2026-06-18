package uom.msd.lostfound.dto;

import java.time.LocalDateTime;

import uom.msd.lostfound.enums.ClaimStatus;

/**
 * DTO for claim details - used in GET endpoints
 */
public class ClaimResponseDTO {
    private Long id;
    private Long claimId;
    private ClaimStatus status;
    private String claimantUsername;
    private Long claimantId;
    private ItemSummaryDTO item;
    private ItemMatchSummaryDTO match;
    private String evidence;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ClaimResponseDTO() {
    }

    public ClaimResponseDTO(Long id, ClaimStatus status, String claimantUsername, Long claimantId,
                            ItemSummaryDTO item, ItemMatchSummaryDTO match, String evidence,
                            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.claimId = id;
        this.status = status;
        this.claimantUsername = claimantUsername;
        this.claimantId = claimantId;
        this.item = item;
        this.match = match;
        this.evidence = evidence;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public String getClaimantUsername() {
        return claimantUsername;
    }

    public void setClaimantUsername(String claimantUsername) {
        this.claimantUsername = claimantUsername;
    }

    public Long getClaimantId() {
        return claimantId;
    }

    public void setClaimantId(Long claimantId) {
        this.claimantId = claimantId;
    }

    public ItemSummaryDTO getItem() {
        return item;
    }

    public void setItem(ItemSummaryDTO item) {
        this.item = item;
    }

    public ItemMatchSummaryDTO getMatch() {
        return match;
    }

    public void setMatch(ItemMatchSummaryDTO match) {
        this.match = match;
    }

    public String getEvidence() {
        return evidence;
    }

    public void setEvidence(String evidence) {
        this.evidence = evidence;
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

    /**
     * Nested DTO for item summary
     */
    public static class ItemSummaryDTO {
        private Long itemId;
        private String title;
        private String description;
        private String category;
        private String location;

        public ItemSummaryDTO() {
        }

        public ItemSummaryDTO(Long itemId, String title, String description, String category, String location) {
            this.itemId = itemId;
            this.title = title;
            this.description = description;
            this.category = category;
            this.location = location;
        }

        public Long getItemId() {
            return itemId;
        }

        public void setItemId(Long itemId) {
            this.itemId = itemId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }
    }

    /**
     * Nested DTO for item match summary
     */
    public static class ItemMatchSummaryDTO {
        private Long matchId;
        private Long lostItemId;
        private Long foundItemId;
        private java.math.BigDecimal confidenceScore;

        public ItemMatchSummaryDTO() {
        }

        public ItemMatchSummaryDTO(Long matchId, Long lostItemId, Long foundItemId, java.math.BigDecimal confidenceScore) {
            this.matchId = matchId;
            this.lostItemId = lostItemId;
            this.foundItemId = foundItemId;
            this.confidenceScore = confidenceScore;
        }

        public Long getMatchId() {
            return matchId;
        }

        public void setMatchId(Long matchId) {
            this.matchId = matchId;
        }

        public Long getLostItemId() {
            return lostItemId;
        }

        public void setLostItemId(Long lostItemId) {
            this.lostItemId = lostItemId;
        }

        public Long getFoundItemId() {
            return foundItemId;
        }

        public void setFoundItemId(Long foundItemId) {
            this.foundItemId = foundItemId;
        }

        public java.math.BigDecimal getConfidenceScore() {
            return confidenceScore;
        }

        public void setConfidenceScore(java.math.BigDecimal confidenceScore) {
            this.confidenceScore = confidenceScore;
        }
    }
}
