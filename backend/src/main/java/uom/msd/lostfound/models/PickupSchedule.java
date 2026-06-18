package uom.msd.lostfound.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "pickup_schedules", indexes = {
        @Index(name = "idx_pickup_schedules_claim_id", columnList = "claim_id"),
        @Index(name = "idx_pickup_schedules_scheduled_at", columnList = "scheduled_at")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_pickup_claim", columnNames = "claim_id")
})
public class PickupSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false, unique = true)
    private Claim claim;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Column(nullable = false, length = 255)
    private String location;

    @Column
    private LocalDateTime handoverConfirmedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handover_confirmed_by")
    private User handoverConfirmedBy;

    public PickupSchedule() {
    }

    public PickupSchedule(Claim claim, LocalDateTime scheduledAt, String location) {
        this.claim = claim;
        this.scheduledAt = scheduledAt;
        this.location = location;
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

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getHandoverConfirmedAt() {
        return handoverConfirmedAt;
    }

    public void setHandoverConfirmedAt(LocalDateTime handoverConfirmedAt) {
        this.handoverConfirmedAt = handoverConfirmedAt;
    }

    public User getHandoverConfirmedBy() {
        return handoverConfirmedBy;
    }

    public void setHandoverConfirmedBy(User handoverConfirmedBy) {
        this.handoverConfirmedBy = handoverConfirmedBy;
    }
}
