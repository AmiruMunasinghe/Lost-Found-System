package uom.msd.lostfound.services;

import uom.msd.lostfound.dto.ClaimResponseDTO;
import uom.msd.lostfound.dto.PickupScheduleDTO;
import uom.msd.lostfound.enums.ClaimStatus;
import uom.msd.lostfound.models.Claim;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service interface for claim management
 */
public interface ClaimService {
    /**
     * Get all claims with optional filtering and pagination
     */
    List<Claim> getAllClaims(ClaimStatus status, int page, int size);

    /**
     * Get a specific claim by ID
     */
    Optional<Claim> getClaimById(Long claimId);

    /**
     * Get claims for a specific claimant
     */
    List<Claim> getClaimsByClaimantId(Long claimantId);

    /**
     * Create a new claim
     */
    Claim createClaim(Long itemMatchId, Long claimantId) throws Exception;

    /**
     * Approve a claim and transition to APPROVED status
     * @throws InvalidClaimStatusTransitionException if claim cannot be approved
     */
    Claim approveClaim(Long claimId, Long adminId) throws Exception;

    /**
     * Reject a claim with a reason
     * @throws InvalidClaimStatusTransitionException if claim cannot be rejected
     */
    Claim rejectClaim(Long claimId, String reason, Long adminId) throws Exception;

    /**
     * Request evidence from claimant
     */
    void requestEvidence(Long claimId, String message, Long adminId) throws Exception;

    /**
     * Schedule pickup for an approved claim
     */
    void schedulePickup(Long claimId, LocalDateTime pickupAt, String location, Long adminId) throws Exception;

    /**
     * Confirm handover of item to claimant
     */
    void confirmHandover(Long claimId, Long adminId) throws Exception;

    /**
     * Close a claim
     */
    Claim closeClaim(Long claimId, Long adminId) throws Exception;

    /**
     * Get total count of claims with a specific status
     */
    Long getClaimCountByStatus(ClaimStatus status);

    /**
     * Get claims within a date range
     */
    List<Claim> getClaimsBetweenDates(LocalDateTime from, LocalDateTime to);

    /**
     * Get claims with a specific status within a date range (for analytics)
     */
    List<Claim> getClaimsByStatusBetweenDates(ClaimStatus status, LocalDateTime from, LocalDateTime to);
}
