package uom.msd.lostfound.dto;

import uom.msd.lostfound.enums.MatchStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MatchResponseDTO {
    private Long id;
    private ItemResponseDTO lostItem;
    private ItemResponseDTO foundItem;
    private BigDecimal confidenceScore;
    private MatchStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MatchResponseDTO() {
    }

    public MatchResponseDTO(Long id, ItemResponseDTO lostItem, ItemResponseDTO foundItem,
                            BigDecimal confidenceScore, MatchStatus status,
                            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.lostItem = lostItem;
        this.foundItem = foundItem;
        this.confidenceScore = confidenceScore;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ItemResponseDTO getLostItem() {
        return lostItem;
    }

    public void setLostItem(ItemResponseDTO lostItem) {
        this.lostItem = lostItem;
    }

    public ItemResponseDTO getFoundItem() {
        return foundItem;
    }

    public void setFoundItem(ItemResponseDTO foundItem) {
        this.foundItem = foundItem;
    }

    public BigDecimal getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(BigDecimal confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public MatchStatus getStatus() {
        return status;
    }

    public void setStatus(MatchStatus status) {
        this.status = status;
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
}
