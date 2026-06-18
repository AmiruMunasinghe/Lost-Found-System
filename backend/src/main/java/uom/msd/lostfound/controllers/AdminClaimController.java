package uom.msd.lostfound.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import uom.msd.lostfound.auth.AuthenticatedUser;
import uom.msd.lostfound.dto.ClaimListResponseDTO;
import uom.msd.lostfound.dto.ClaimResponseDTO;
import uom.msd.lostfound.dto.PickupScheduleDTO;
import uom.msd.lostfound.dto.RejectClaimRequest;
import uom.msd.lostfound.dto.RequestEvidenceDTO;
import uom.msd.lostfound.enums.ClaimStatus;
import uom.msd.lostfound.exceptions.ResourceNotFoundException;
import uom.msd.lostfound.models.Claim;
import uom.msd.lostfound.models.ItemMatch;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.models.PickupSchedule;
import uom.msd.lostfound.repositories.UserRepository;
import uom.msd.lostfound.repositories.PickupScheduleRepository;
import uom.msd.lostfound.services.ClaimService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for admin claim management
 */
@Slf4j
@RestController
@RequestMapping("/admin/claims")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminClaimController {

    @Autowired
    private ClaimService claimService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PickupScheduleRepository pickupScheduleRepository;

    /**
     * Get all claims with optional status filter
     * GET /admin/claims?status=PENDING&page=0&size=20
     */
    @GetMapping
    public ResponseEntity<ClaimListResponseDTO> getAllClaims(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam(required = false) ClaimStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<Claim> claims = claimService.getAllClaims(status, page, size);
            List<ClaimResponseDTO> dtos = claims.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            ClaimListResponseDTO response = new ClaimListResponseDTO();
            response.setClaims(dtos);
            response.setTotalCount((long) dtos.size());
            response.setPage(page);
            response.setSize(size);
            response.setTotalPages((int) Math.ceil((double) dtos.size() / size));
            response.setHasNext((page + 1) * size < dtos.size());
            response.setHasPrevious(page > 0);

            log.info("Retrieved {} claims", dtos.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving claims", e);
            throw new RuntimeException(e);
        }
    }

    /**
     * Get a specific claim by ID
     * GET /admin/claims/{claimId}
     */
    @GetMapping("/{claimId}")
    public ResponseEntity<ClaimResponseDTO> getClaimById(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable Long claimId) {
        try {
            Optional<Claim> claim = claimService.getClaimById(claimId);
            if (claim.isPresent()) {
                ClaimResponseDTO dto = convertToDTO(claim.get());
                log.info("Retrieved claim {}", claimId);
                return ResponseEntity.ok(dto);
            }
            throw new ResourceNotFoundException("Claim not found with id: " + claimId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving claim {}", claimId, e);
            throw new RuntimeException(e);
        }
    }

    /**
     * Approve a claim
     * POST /admin/claims/{claimId}/approve
     */
    @PostMapping("/{claimId}/approve")
    public ResponseEntity<ClaimResponseDTO> approveClaim(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable Long claimId) {
        try {
            Claim claim = claimService.approveClaim(claimId, authenticatedUser.getId());
            ClaimResponseDTO dto = convertToDTO(claim);
            log.info("Approved claim {} by admin {}", claimId, authenticatedUser.getId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error approving claim {}", claimId, e);
            throw new RuntimeException(e);
        }
    }

    /**
     * Reject a claim with a reason
     * POST /admin/claims/{claimId}/reject
     */
    @PostMapping("/{claimId}/reject")
    public ResponseEntity<ClaimResponseDTO> rejectClaim(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable Long claimId,
            @RequestBody RejectClaimRequest request) {
        try {
            Claim claim = claimService.rejectClaim(claimId, request.getReason(), authenticatedUser.getId());
            ClaimResponseDTO dto = convertToDTO(claim);
            log.info("Rejected claim {} by admin {}", claimId, authenticatedUser.getId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error rejecting claim {}", claimId, e);
            throw new RuntimeException(e);
        }
    }

    /**
     * Request evidence from claimant
     * POST /admin/claims/{claimId}/request-evidence
     */
    @PostMapping("/{claimId}/request-evidence")
    public ResponseEntity<Void> requestEvidence(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable Long claimId,
            @RequestBody RequestEvidenceDTO request) {
        try {
            claimService.requestEvidence(claimId, request.getMessage(), authenticatedUser.getId());
            log.info("Evidence requested for claim {} by admin {}", claimId, authenticatedUser.getId());
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            log.error("Error requesting evidence for claim {}", claimId, e);
            throw new RuntimeException(e);
        }
    }

    /**
     * Schedule pickup for a claim
     * POST /admin/claims/{claimId}/pickup-schedule
     */
    @PostMapping("/{claimId}/pickup-schedule")
    public ResponseEntity<Void> schedulePickup(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable Long claimId,
            @RequestBody PickupScheduleDTO request) {
        try {
            claimService.schedulePickup(claimId, request.getPickupAt(), request.getLocation(), 
                    authenticatedUser.getId());
            log.info("Pickup scheduled for claim {} by admin {}", claimId, authenticatedUser.getId());
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            log.error("Error scheduling pickup for claim {}", claimId, e);
            throw new RuntimeException(e);
        }
    }

    /**
     * Confirm handover of item to claimant
     * POST /admin/claims/{claimId}/confirm-handover
     */
    @PostMapping("/{claimId}/confirm-handover")
    public ResponseEntity<ClaimResponseDTO> confirmHandover(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable Long claimId) {
        try {
            claimService.confirmHandover(claimId, authenticatedUser.getId());
            Optional<Claim> claim = claimService.getClaimById(claimId);
            ClaimResponseDTO dto = convertToDTO(claim.get());
            log.info("Handover confirmed for claim {} by admin {}", claimId, authenticatedUser.getId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error confirming handover for claim {}", claimId, e);
            throw new RuntimeException(e);
        }
    }

    /**
     * Convert Claim entity to ClaimResponseDTO
     */
    private ClaimResponseDTO convertToDTO(Claim claim) {
        ItemMatch match = claim.getItemMatch();
        
        ClaimResponseDTO.ItemSummaryDTO itemSummary = new ClaimResponseDTO.ItemSummaryDTO(
                match.getLostItem().getId(),
                match.getLostItem().getTitle(),
                match.getLostItem().getDescription(),
                match.getLostItem().getCategory(),
                match.getLostItem().getLocation()
        );

        ClaimResponseDTO.ItemMatchSummaryDTO matchSummary = new ClaimResponseDTO.ItemMatchSummaryDTO(
                match.getId(),
                match.getLostItem().getId(),
                match.getFoundItem().getId(),
                match.getConfidenceScore()
        );

        Optional<PickupSchedule> pickupOpt = pickupScheduleRepository.findByClaimId(claim.getId());
        ClaimResponseDTO.PickupDTO pickupDTO = pickupOpt.map(p -> new ClaimResponseDTO.PickupDTO(
                p.getScheduledAt().toString(),
                p.getLocation()
        )).orElse(null);

        return new ClaimResponseDTO(
                claim.getId(),
                claim.getStatus(),
                claim.getClaimant().getUsername(),
                claim.getClaimant().getId(),
                itemSummary,
                matchSummary,
                claim.getEvidence(),
                claim.getRequestedAt(),
                claim.getUpdatedAt(),
                pickupDTO
        );
    }
}
