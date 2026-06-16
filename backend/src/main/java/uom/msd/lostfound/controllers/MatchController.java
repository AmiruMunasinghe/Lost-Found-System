package uom.msd.lostfound.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
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

import java.util.List;
import java.util.stream.Collectors;

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
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<MatchResponseDTO>> getMatches(
            @RequestParam(required = false) MatchStatus status,
            @RequestParam(required = false) Long lostItemId,
            @RequestParam(required = false) Long foundItemId,
            @RequestParam(required = false) Long itemId) {

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
     * Retrieve a specific match.
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
     * Confirm a suggested match. Sets match status to ACCEPTED and both items to MATCHED status.
     */
    @PostMapping("/{matchId}/confirm")
    public ResponseEntity<MatchResponseDTO> confirmMatch(@PathVariable Long matchId) {
        ItemMatch match = itemMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        if (match.getStatus() == MatchStatus.REJECTED) {
            throw new RuntimeException("Cannot confirm a rejected match");
        }

        match.setStatus(MatchStatus.ACCEPTED);
        
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
     * Reject a suggested/pending match.
     */
    @PostMapping("/{matchId}/reject")
    public ResponseEntity<MatchResponseDTO> rejectMatch(@PathVariable Long matchId) {
        ItemMatch match = itemMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        match.setStatus(MatchStatus.REJECTED);
        ItemMatch savedMatch = itemMatchRepository.save(match);

        log.info("Match id={} rejected.", matchId);

        return ResponseEntity.ok(convertToMatchResponseDTO(savedMatch));
    }

    /**
     * GET /matches/review-queue
     * Retrieve all matches with status PENDING_REVIEW (for administrator manual verification).
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
     * Admin approves a match in the manual review queue, promoting it to SUGGESTED and notifying users.
     */
    @PostMapping("/review-queue/{matchId}/approve")
    public ResponseEntity<MatchResponseDTO> approvePendingMatch(@PathVariable Long matchId) {
        ItemMatch match = itemMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        if (match.getStatus() != MatchStatus.PENDING_REVIEW) {
            throw new RuntimeException("Match is not in PENDING_REVIEW status");
        }

        match.setStatus(MatchStatus.SUGGESTED);
        ItemMatch savedMatch = itemMatchRepository.save(match);
        
        // Notify users since it is now approved as a suggested match
        matchingEngine.notifyOnHighMatch(savedMatch);

        log.info("Pending match id={} approved by admin. Status promoted to SUGGESTED.", matchId);

        return ResponseEntity.ok(convertToMatchResponseDTO(savedMatch));
    }

    /**
     * POST /matches/review-queue/{matchId}/reject
     * Admin rejects a match in the manual review queue, marking it as REJECTED.
     */
    @PostMapping("/review-queue/{matchId}/reject")
    public ResponseEntity<MatchResponseDTO> rejectPendingMatch(@PathVariable Long matchId) {
        ItemMatch match = itemMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        if (match.getStatus() != MatchStatus.PENDING_REVIEW) {
            throw new RuntimeException("Match is not in PENDING_REVIEW status");
        }

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
