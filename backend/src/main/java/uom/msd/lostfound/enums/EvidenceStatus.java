package uom.msd.lostfound.enums;

/**
 * Enum representing the status of an evidence request.
 * Tracks the back-and-forth between admin and claimant regarding evidence submission.
 */
public enum EvidenceStatus {
    /**
     * Evidence has been requested from the claimant, awaiting response.
     */
    REQUESTED,

    /**
     * Claimant has provided evidence in response to the request.
     */
    PROVIDED,

    /**
     * Evidence request is pending (initial state or awaiting re-submission).
     */
    PENDING
}
