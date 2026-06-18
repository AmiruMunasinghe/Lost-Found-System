package uom.msd.lostfound.enums;

/**
 * Enum representing admin actions that are audited.
 * Tracks all administrative claim management operations.
 */
public enum AuditAction {
    /**
     * Admin approved a claim.
     */
    APPROVE_CLAIM,

    /**
     * Admin rejected a claim.
     */
    REJECT_CLAIM,

    /**
     * Admin requested evidence from claimant.
     */
    REQUEST_EVIDENCE,

    /**
     * Admin scheduled a pickup for a claim.
     */
    SCHEDULE_PICKUP,

    /**
     * Admin confirmed handover of item to claimant.
     */
    CONFIRM_HANDOVER,

    /**
     * Admin closed a claim.
     */
    CLOSE_CLAIM
}
