package uom.msd.lostfound.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uom.msd.lostfound.enums.AuditAction;
import uom.msd.lostfound.enums.ClaimStatus;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.MatchStatus;
import uom.msd.lostfound.exceptions.ResourceNotFoundException;
import uom.msd.lostfound.models.Claim;
import uom.msd.lostfound.models.EvidenceRequest;
import uom.msd.lostfound.models.ItemMatch;
import uom.msd.lostfound.models.PickupSchedule;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.ClaimRepository;
import uom.msd.lostfound.repositories.EvidenceRequestRepository;
import uom.msd.lostfound.repositories.ItemMatchRepository;
import uom.msd.lostfound.repositories.ItemRepository;
import uom.msd.lostfound.repositories.PickupScheduleRepository;
import uom.msd.lostfound.repositories.UserRepository;
import uom.msd.lostfound.services.AuditLogService;
import uom.msd.lostfound.services.ClaimService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemMatchRepository itemMatchRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final EvidenceRequestRepository evidenceRequestRepository;
    private final PickupScheduleRepository pickupScheduleRepository;
    private final AuditLogService auditLogService;

    public ClaimServiceImpl(ClaimRepository claimRepository,
                          ItemMatchRepository itemMatchRepository,
                          ItemRepository itemRepository,
                          UserRepository userRepository,
                          EvidenceRequestRepository evidenceRequestRepository,
                          PickupScheduleRepository pickupScheduleRepository,
                          AuditLogService auditLogService) {
        this.claimRepository = claimRepository;
        this.itemMatchRepository = itemMatchRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.evidenceRequestRepository = evidenceRequestRepository;
        this.pickupScheduleRepository = pickupScheduleRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Claim> getAllClaims(ClaimStatus status, int page, int size) {
        if (status != null) {
            return claimRepository.findByStatus(status);
        }
        return claimRepository.findAllOrderByRequestedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Claim> getClaimById(Long claimId) {
        return claimRepository.findById(claimId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Claim> getClaimsByClaimantId(Long claimantId) {
        return claimRepository.findByClaimantId(claimantId);
    }

    @Override
    public Claim createClaim(Long itemMatchId, Long claimantId) throws Exception {
        ItemMatch itemMatch = itemMatchRepository.findById(itemMatchId)
                .orElseThrow(() -> new ResourceNotFoundException("ItemMatch not found with id: " + itemMatchId));

        User claimant = userRepository.findById(claimantId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + claimantId));

        // Check if claim already exists for this match
        if (claimRepository.findByItemMatchId(itemMatchId).isPresent()) {
            throw new IllegalArgumentException("Claim already exists for this item match");
        }

        Claim claim = new Claim(itemMatch, claimant);
        return claimRepository.save(claim);
    }

    @Override
    public Claim approveClaim(Long claimId, Long adminId) throws Exception {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        // Validate state transition
        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new IllegalStateException("Can only approve PENDING claims. Current status: " + claim.getStatus());
        }

        // Update claim status
        claim.setStatus(ClaimStatus.APPROVED);
        claim.setUpdatedAt(LocalDateTime.now());
        Claim updated = claimRepository.save(claim);

        // Update associated item match status
        ItemMatch match = claim.getItemMatch();
        match.setStatus(MatchStatus.ACCEPTED);
        itemMatchRepository.save(match);

        // Update item statuses
        match.getLostItem().setStatus(ItemStatus.MATCHED);
        match.getFoundItem().setStatus(ItemStatus.MATCHED);
        itemRepository.save(match.getLostItem());
        itemRepository.save(match.getFoundItem());

        // Log audit
        auditLogService.logAction(adminId, AuditAction.APPROVE_CLAIM, "Claim", claimId, "SUCCESS",
                "Claim approved and item match updated");

        log.info("Claim {} approved by admin {}", claimId, adminId);
        return updated;
    }

    @Override
    public Claim rejectClaim(Long claimId, String reason, Long adminId) throws Exception {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        // Validate state transition
        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new IllegalStateException("Can only reject PENDING claims. Current status: " + claim.getStatus());
        }

        // Update claim status
        claim.setStatus(ClaimStatus.REJECTED);
        claim.setUpdatedAt(LocalDateTime.now());
        Claim updated = claimRepository.save(claim);

        // Update associated item match status
        ItemMatch match = claim.getItemMatch();
        match.setStatus(MatchStatus.REJECTED);
        itemMatchRepository.save(match);

        // Log audit
        auditLogService.logAction(adminId, AuditAction.REJECT_CLAIM, "Claim", claimId, "SUCCESS",
                "Claim rejected. Reason: " + reason);

        log.info("Claim {} rejected by admin {}. Reason: {}", claimId, adminId, reason);
        return updated;
    }

    @Override
    public void requestEvidence(Long claimId, String message, Long adminId) throws Exception {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        // Validate that claim is in appropriate state
        if (claim.getStatus() != ClaimStatus.PENDING && claim.getStatus() != ClaimStatus.APPROVED) {
            throw new IllegalStateException("Cannot request evidence for claim in status: " + claim.getStatus());
        }

        // Create evidence request
        EvidenceRequest evidenceRequest = new EvidenceRequest(claim, message);
        evidenceRequestRepository.save(evidenceRequest);

        // Log audit
        auditLogService.logAction(adminId, AuditAction.REQUEST_EVIDENCE, "Claim", claimId, "SUCCESS",
                "Evidence requested from claimant: " + message);

        log.info("Evidence requested for claim {} by admin {}", claimId, adminId);
    }

    @Override
    public void schedulePickup(Long claimId, LocalDateTime pickupAt, String location, Long adminId) throws Exception {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        // Validate state transition
        if (claim.getStatus() != ClaimStatus.APPROVED) {
            throw new IllegalStateException("Can only schedule pickup for APPROVED claims. Current status: " + claim.getStatus());
        }

        // Update claim status
        claim.setStatus(ClaimStatus.AWAITING_PICKUP);
        claim.setUpdatedAt(LocalDateTime.now());
        claimRepository.save(claim);

        // Create pickup schedule
        PickupSchedule schedule = new PickupSchedule(claim, pickupAt, location);
        pickupScheduleRepository.save(schedule);

        // Log audit
        auditLogService.logAction(adminId, AuditAction.SCHEDULE_PICKUP, "Claim", claimId, "SUCCESS",
                "Pickup scheduled at " + location + " on " + pickupAt);

        log.info("Pickup scheduled for claim {} at {} on {}", claimId, location, pickupAt);
    }

    @Override
    public void confirmHandover(Long claimId, Long adminId) throws Exception {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        // Validate state transition
        if (claim.getStatus() != ClaimStatus.AWAITING_PICKUP) {
            throw new IllegalStateException("Can only confirm handover for AWAITING_PICKUP claims. Current status: " + claim.getStatus());
        }

        // Update claim status
        claim.setStatus(ClaimStatus.HANDED_OVER);
        claim.setUpdatedAt(LocalDateTime.now());
        claimRepository.save(claim);

        // Update pickup schedule
        PickupSchedule schedule = pickupScheduleRepository.findByClaimId(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("PickupSchedule not found for claim: " + claimId));
        schedule.setHandoverConfirmedAt(LocalDateTime.now());
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));
        schedule.setHandoverConfirmedBy(admin);
        pickupScheduleRepository.save(schedule);

        // Update item statuses
        ItemMatch match = claim.getItemMatch();
        match.getLostItem().setStatus(ItemStatus.CLOSED);
        match.getFoundItem().setStatus(ItemStatus.CLOSED);
        itemRepository.save(match.getLostItem());
        itemRepository.save(match.getFoundItem());

        // Log audit
        auditLogService.logAction(adminId, AuditAction.CONFIRM_HANDOVER, "Claim", claimId, "SUCCESS",
                "Handover confirmed and items marked as closed");

        log.info("Handover confirmed for claim {} by admin {}", claimId, adminId);
    }

    @Override
    public Claim closeClaim(Long claimId, Long adminId) throws Exception {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        // Validate state transition - can close from HANDED_OVER or REJECTED
        if (claim.getStatus() != ClaimStatus.HANDED_OVER && claim.getStatus() != ClaimStatus.REJECTED) {
            throw new IllegalStateException("Can only close HANDED_OVER or REJECTED claims. Current status: " + claim.getStatus());
        }

        claim.setStatus(ClaimStatus.CLOSED);
        claim.setUpdatedAt(LocalDateTime.now());
        Claim updated = claimRepository.save(claim);

        // Log audit
        auditLogService.logAction(adminId, AuditAction.CLOSE_CLAIM, "Claim", claimId, "SUCCESS",
                "Claim closed");

        log.info("Claim {} closed by admin {}", claimId, adminId);
        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public Long getClaimCountByStatus(ClaimStatus status) {
        return claimRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Claim> getClaimsBetweenDates(LocalDateTime from, LocalDateTime to) {
        return claimRepository.findByCreatedAtBetween(from, to);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Claim> getClaimsByStatusBetweenDates(ClaimStatus status, LocalDateTime from, LocalDateTime to) {
        return claimRepository.findByStatusAndCreatedAtBetween(status, from, to);
    }
}
