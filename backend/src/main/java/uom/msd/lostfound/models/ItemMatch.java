package uom.msd.lostfound.models;

import jakarta.persistence.*;
import uom.msd.lostfound.enums.MatchStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_matches", uniqueConstraints = {
        @UniqueConstraint(name = "uk_item_match", columnNames = {"lost_item_id", "found_item_id"})
}, indexes = {
        @Index(name = "idx_match_status", columnList = "status"),
        @Index(name = "idx_confidence_score", columnList = "confidence_score"),
        @Index(name = "idx_match_created_at", columnList = "created_at")
})
public class ItemMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lost_item_id", nullable = false)
    private Item lostItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "found_item_id", nullable = false)
    private Item foundItem;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal confidenceScore = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status = MatchStatus.SUGGESTED;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public ItemMatch() {
    }

    public ItemMatch(Item lostItem, Item foundItem, BigDecimal confidenceScore) {
        this.lostItem = lostItem;
        this.foundItem = foundItem;
        this.confidenceScore = confidenceScore;
        this.status = MatchStatus.SUGGESTED;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Item getLostItem() {
        return lostItem;
    }

    public void setLostItem(Item lostItem) {
        this.lostItem = lostItem;
    }

    public Item getFoundItem() {
        return foundItem;
    }

    public void setFoundItem(Item foundItem) {
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
