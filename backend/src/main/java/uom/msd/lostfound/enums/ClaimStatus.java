package uom.msd.lostfound.enums;

/**
 * Enum representing the lifecycle status of a claim.
 * 
 * Flow: PENDING → APPROVED/REJECTED → AWAITING_PICKUP → HANDED_OVER → CLOSED
 */
public enum ClaimStatus {
    /**
     * Claim has been submitted but not yet reviewed by admin.
     */
    PENDING,

    /**
     * Claim has been approved by admin; awaiting pickup scheduling.
     */
    APPROVED,

    /**
     * Claim has been rejected by admin.
     */
    REJECTED,

    /**
     * Claim has been approved and scheduled for pickup.
     */
    AWAITING_PICKUP,

    /**
     * Item has been handed over to the claimant; awaiting close.
     */
    HANDED_OVER,

    /**
     * Claim has been closed (fully resolved).
     */
    CLOSED
}
