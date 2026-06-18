package uom.msd.lostfound.models;

import jakarta.persistence.*;
import uom.msd.lostfound.enums.ClaimStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "claims", indexes = {
        @Index(name = "idx_claims_status", columnList = "status"),
        @Index(name = "idx_claims_claimant_id", columnList = "claimant_id"),
        @Index(name = "idx_claims_requested_at", columnList = "requested_at"),
        @Index(name = "idx_claims_status_and_created_at", columnList = "status, requested_at")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_claim_item_match", columnNames = "item_match_id")
})
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_match_id", nullable = false, unique = true)
    private ItemMatch itemMatch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claimant_id", nullable = false)
    private User claimant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status = ClaimStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String evidence;

    @Column(nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        requestedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Claim() {
    }

    public Claim(ItemMatch itemMatch, User claimant) {
        this.itemMatch = itemMatch;
        this.claimant = claimant;
        this.status = ClaimStatus.PENDING;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ItemMatch getItemMatch() {
        return itemMatch;
    }

    public void setItemMatch(ItemMatch itemMatch) {
        this.itemMatch = itemMatch;
    }

    public User getClaimant() {
        return claimant;
    }

    public void setClaimant(User claimant) {
        this.claimant = claimant;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public String getEvidence() {
        return evidence;
    }

    public void setEvidence(String evidence) {
        this.evidence = evidence;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
