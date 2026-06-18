package uom.msd.lostfound.models;

import jakarta.persistence.*;
import uom.msd.lostfound.enums.EvidenceStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "evidence_requests", indexes = {
        @Index(name = "idx_evidence_requests_claim_id", columnList = "claim_id"),
        @Index(name = "idx_evidence_requests_status", columnList = "status")
})
public class EvidenceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvidenceStatus status = EvidenceStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    @Column
    private LocalDateTime respondedAt;

    @Column(columnDefinition = "TEXT")
    private String responseMessage;

    @PrePersist
    protected void onCreate() {
        requestedAt = LocalDateTime.now();
    }

    public EvidenceRequest() {
    }

    public EvidenceRequest(Claim claim, String message) {
        this.claim = claim;
        this.message = message;
        this.status = EvidenceStatus.PENDING;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Claim getClaim() {
        return claim;
    }

    public void setClaim(Claim claim) {
        this.claim = claim;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public EvidenceStatus getStatus() {
        return status;
    }

    public void setStatus(EvidenceStatus status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }

    public String getResponseMessage() {
        return responseMessage;
    }

    public void setResponseMessage(String responseMessage) {
        this.responseMessage = responseMessage;
    }
}
