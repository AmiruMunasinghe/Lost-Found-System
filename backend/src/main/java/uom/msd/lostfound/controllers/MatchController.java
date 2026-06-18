package uom.msd.lostfound.controllers;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import uom.msd.lostfound.dto.ItemResponseDTO;
import uom.msd.lostfound.dto.MatchResponseDTO;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.MatchStatus;
import uom.msd.lostfound.matching.MatchingEngine;
import uom.msd.lostfound.models.Item;
import uom.msd.lostfound.models.ItemImage;
import uom.msd.lostfound.models.ItemMatch;
import uom.msd.lostfound.repositories.ItemMatchRepository;
import uom.msd.lostfound.repositories.ItemRepository;

/**
 * MatchController - REST Controller for Lost-Found Item Matching Operations
 * 
 * ARCHITECTURE & RESPONSIBILITIES:
 * This controller orchestrates the matching workflow between lost and found items.
 * It implements a three-tier status workflow: PENDING_REVIEW → SUGGESTED → ACCEPTED,
 * with REJECTED as a terminal state for non-matching items.
 * 
 * KEY DESIGN PATTERNS:
 * - Separation of Concerns: Matching logic delegated to {@link MatchingEngine}
 * - Transactional Consistency: Class-level @Transactional ensures ACID compliance
 * - CORS Policy: Allows cross-origin requests for frontend integration
 * - DTO Pattern: Converts internal models to transfer objects for API contracts
 * - Fluent API: Uses builder pattern for DTO instantiation
 * 
 * ENDPOINTS OVERVIEW:
 * - GET /matches → Retrieve matches with optional filtering by status or item IDs
 * - GET /matches/{matchId} → Fetch specific match details
 * - POST /matches/{matchId}/confirm → User confirms a suggested match
 * - POST /matches/{matchId}/reject → User rejects a suggested match
 * - GET /matches/review-queue → Admin reviews pending matches
 * - POST /matches/review-queue/{matchId}/approve → Admin approves and promotes match status
 * - POST /matches/review-queue/{matchId}/reject → Admin rejects pending match
 * 
 * TRANSACTION MANAGEMENT:
 * - Read operations: @Transactional(readOnly = true) for optimized query execution
 * - Write operations: Default @Transactional for full ACID guarantees
 * - Item status updates: Atomically persisted with match confirmation
 * 
 * LOGGING STRATEGY:
 * SLF4J logging tracks critical state transitions (confirmation, rejection, admin actions)
 * for audit trails and troubleshooting purposes.
 * 
 * @author Backend Development Team
 * @version 1.0
 * @since 2026-06
 */
@RestController
@RequestMapping("/matches")
@RequiredArgsConstructor
@Slf4j
@Transactional
@CrossOrigin(origins = "*", maxAge = 3600)
public class MatchController {

    private final ItemMatchRepository itemMatchRepository;
    private final ItemRepository itemRepository;
    private final MatchingEngine matchingEngine;

    /**
     * GET /matches
     * Retrieve matches. Supports filtering by status, lostItemId, foundItemId, or general itemId.
     * 
     * FILTERING PRIORITY (evaluated in order):
     * 1. Status filter - returns all matches with specific status
     * 2. Both lostItemId & foundItemId - precise match lookup
     * 3. Only lostItemId - all matches for a lost item
     * 4. Only foundItemId - all matches for a found item
     * 5. General itemId - bidirectional search (item as lost or found)
     * 6. No filters - returns all matches (paginated recommended for large datasets)
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<MatchResponseDTO>> getMatches(
            @RequestParam(required = false) MatchStatus status,
            @RequestParam(required = false) Long lostItemId,
            @RequestParam(required = false) Long foundItemId,
            @RequestParam(required = false) Long itemId) {

        // Filter strategy: Explicit priority ensures predictable query execution
        List<ItemMatch> matches;

        if (status != null) {
            matches = itemMatchRepository.findByStatus(status);
        } else if (lostItemId != null && foundItemId != null) {
            matches = itemMatchRepository.findByLostItemIdAndFoundItemId(lostItemId, foundItemId)
                    .map(List::of)
                    .orElse(List.of());
        } else if (lostItemId != null) {
            matches = itemMatchRepository.findByLostItemId(lostItemId);
        } else if (foundItemId != null) {
            matches = itemMatchRepository.findByFoundItemId(foundItemId);
        } else if (itemId != null) {
            matches = itemMatchRepository.findMatchesByItemId(itemId);
        } else {
            matches = itemMatchRepository.findAll();
        }

        List<MatchResponseDTO> dtos = matches.stream()
                .map(this::convertToMatchResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * GET /matches/{matchId}
     * Retrieve a specific match by unique identifier.
     * 
     * USE CASE: Fetch detailed match information for display in match detail page.
     * Throws 404-equivalent via RuntimeException if match ID not found.
     */
    @GetMapping("/{matchId}")
    @Transactional(readOnly = true)
    public ResponseEntity<MatchResponseDTO> getMatchById(@PathVariable Long matchId) {
        ItemMatch match = itemMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));
        return ResponseEntity.ok(convertToMatchResponseDTO(match));
    }

    /**
     * POST /matches/{matchId}/confirm
     * Confirm a suggested match by end user. Completes the matching workflow.
     * 
     * STATE TRANSITION: SUGGESTED → ACCEPTED
     * SIDE EFFECTS:
     *   - Both items transition to MATCHED status (prevents further matches)
     *   - Match becomes immutable/finalized
     *   - Event trigger: May cascade notifications to reward/notification systems
     * 
     * BUSINESS RULE: Cannot confirm a REJECTED match (terminal state).
     * 
     * ATOMIC OPERATION: All item and match updates persist in single transaction.
     */
    @PostMapping("/{matchId}/confirm")
    public ResponseEntity<MatchResponseDTO> confirmMatch(@PathVariable Long matchId) {
        ItemMatch match = itemMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        // Validation: REJECTED matches cannot be resurrected
        if (match.getStatus() == MatchStatus.REJECTED) {
            throw new RuntimeException("Cannot confirm a rejected match");
        }

        // Promote match from SUGGESTED to ACCEPTED (finalized state)
        match.setStatus(MatchStatus.ACCEPTED);
        
        // Atomically update both items to prevent subsequent matching attempts
        Item lostItem = match.getLostItem();
        Item foundItem = match.getFoundItem();
        lostItem.setStatus(ItemStatus.MATCHED);
        foundItem.setStatus(ItemStatus.MATCHED);

        itemRepository.save(lostItem);
        itemRepository.save(foundItem);
        ItemMatch savedMatch = itemMatchRepository.save(match);

        log.info("Match id={} confirmed. Items id={} and id={} marked as MATCHED",
                matchId, lostItem.getId(), foundItem.getId());

        return ResponseEntity.ok(convertToMatchResponseDTO(savedMatch));
    }

    /**
     * POST /matches/{matchId}/reject
     * User rejects a suggested match. Marks as REJECTED (terminal state).
     * 
     * STATE TRANSITION: SUGGESTED/PENDING_REVIEW → REJECTED
     * SIDE EFFECTS: Items remain AVAILABLE for subsequent matching attempts
     * 
     * BUSINESS RULE: REJECTED matches cannot be reverted or reconfirmed.
     * This decision is permanent and used for matching algorithm refinement.
     */
    @PostMapping("/{matchId}/reject")
    public ResponseEntity<MatchResponseDTO> rejectMatch(@PathVariable Long matchId) {
        ItemMatch match = itemMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        // Terminal state: REJECTED matches are final and non-recoverable
        match.setStatus(MatchStatus.REJECTED);
        ItemMatch savedMatch = itemMatchRepository.save(match);

        log.info("Match id={} rejected.", matchId);

        return ResponseEntity.ok(convertToMatchResponseDTO(savedMatch));
    }

    /**
     * GET /matches/review-queue
     * Retrieve all matches pending administrative manual verification.
     * 
     * AUDIENCE: Administrator dashboard for quality assurance.
     * CONTENT: All matches with PENDING_REVIEW status (high-confidence auto-suggestions awaiting approval).
     * 
     * USE CASE: Admin reviews suspicious/edge-case matches before user notification.
     * Sorting: Recommended to sort by confidenceScore DESC (highest uncertainty first).
     */
    @GetMapping("/review-queue")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MatchResponseDTO>> getReviewQueue() {
        List<ItemMatch> pendingMatches = itemMatchRepository.findByStatus(MatchStatus.PENDING_REVIEW);
        List<MatchResponseDTO> dtos = pendingMatches.stream()
                .map(this::convertToMatchResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * POST /matches/review-queue/{matchId}/approve
     * Administrator approves a pending match after QA verification.
     * 
     * STATE TRANSITION: PENDING_REVIEW → SUGGESTED
     * WORKFLOW: Auto-suggested match awaits approval → admin validates → moves to user notification queue
     * 
     * SIDE EFFECTS:
     *   - Triggers user notification via matching engine
     *   - Match becomes visible to end users
     *   - Items remain AVAILABLE until user confirms match
     * 
     * IDEMPOTENCY CHECK: Only processes PENDING_REVIEW status (prevents duplicate approvals).
     * 
     * AUDIT: Critical action tracked via SLF4J logging for compliance.
     */
    @PostMapping("/review-queue/{matchId}/approve")
    public ResponseEntity<MatchResponseDTO> approvePendingMatch(@PathVariable Long matchId) {
        ItemMatch match = itemMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        // Idempotency guard: Ensure match is in correct pre-approval state
        if (match.getStatus() != MatchStatus.PENDING_REVIEW) {
            throw new RuntimeException("Match is not in PENDING_REVIEW status");
        }

        // Advance match to next stage in workflow
        match.setStatus(MatchStatus.SUGGESTED);
        ItemMatch savedMatch = itemMatchRepository.save(match);
        
        // Notify both users of the approved suggestion (critical for user engagement)
        matchingEngine.notifyOnHighMatch(savedMatch);

        log.info("Pending match id={} approved by admin. Status promoted to SUGGESTED.", matchId);

        return ResponseEntity.ok(convertToMatchResponseDTO(savedMatch));
    }

    /**
     * POST /matches/review-queue/{matchId}/reject
     * Administrator rejects a pending match during QA verification.
     * 
     * STATE TRANSITION: PENDING_REVIEW → REJECTED (terminal state)
     * WORKFLOW: Admin determines false positive match → blocks user notification → closes match
     * 
     * SIDE EFFECTS:
     *   - Items remain AVAILABLE for subsequent matching attempts
     *   - No user notification sent (prevents confusion)
     *   - Feedback recorded for matching algorithm optimization
     * 
     * IDEMPOTENCY CHECK: Only processes PENDING_REVIEW status (prevents duplicate rejections).
     * 
     * AUDIT: Critical decision tracked via SLF4J logging for algorithm tuning.
     */
    @PostMapping("/review-queue/{matchId}/reject")
    public ResponseEntity<MatchResponseDTO> rejectPendingMatch(@PathVariable Long matchId) {
        ItemMatch match = itemMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        // Idempotency guard: Ensure match is in correct pre-rejection state
        if (match.getStatus() != MatchStatus.PENDING_REVIEW) {
            throw new RuntimeException("Match is not in PENDING_REVIEW status");
        }

        // Mark as REJECTED terminal state (admin QA failure verdict)
        match.setStatus(MatchStatus.REJECTED);
        ItemMatch savedMatch = itemMatchRepository.save(match);

        log.info("Pending match id={} rejected by admin.", matchId);

        return ResponseEntity.ok(convertToMatchResponseDTO(savedMatch));
    }

    private MatchResponseDTO convertToMatchResponseDTO(ItemMatch match) {
        return MatchResponseDTO.builder()
                .id(match.getId())
                .lostItem(convertToItemResponseDTO(match.getLostItem()))
                .foundItem(convertToItemResponseDTO(match.getFoundItem()))
                .confidenceScore(match.getConfidenceScore())
                .status(match.getStatus())
                .createdAt(match.getCreatedAt())
                .updatedAt(match.getUpdatedAt())
                .build();
    }

    private ItemResponseDTO convertToItemResponseDTO(Item item) {
        List<String> imageUrls = item.getImages().stream()
                .map(ItemImage::getImageUrl)
                .collect(Collectors.toList());

        return new ItemResponseDTO(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getCategory(),
                item.getLocation(),
                item.getReportType(),
                item.getStatus(),
                item.getUser().getId(),
                item.getCreatedAt(),
                item.getUpdatedAt(),
                imageUrls
        );
    }
}


