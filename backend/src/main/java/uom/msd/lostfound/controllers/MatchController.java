package uom.msd.lostfound.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uom.msd.lostfound.auth.AuthenticatedUser;
import uom.msd.lostfound.dto.ItemResponseDTO;
import uom.msd.lostfound.dto.MatchResponseDTO;
import uom.msd.lostfound.dto.RunMatchingRequest;
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
@CrossOrigin(origins = "*", maxAge = 3600)
@Transactional
public class MatchController {

    private final ItemMatchRepository itemMatchRepository;
    private final ItemRepository itemRepository;
    private final MatchingEngine matchingEngine;

    public MatchController(ItemMatchRepository itemMatchRepository,
                           ItemRepository itemRepository,
                           MatchingEngine matchingEngine) {
        this.itemMatchRepository = itemMatchRepository;
        this.itemRepository = itemRepository;
        this.matchingEngine = matchingEngine;
    }

    @PostMapping("/run")
    public ResponseEntity<List<MatchResponseDTO>> runMatchingForLostItem(@RequestParam Long lostItemId) {
        return ResponseEntity.ok(toMatchResponses(matchingEngine.runForFilteredLostItem(lostItemId)));
    }

    @PostMapping("/run-filtered")
    public ResponseEntity<List<MatchResponseDTO>> runMatchingForFilteredLostItems(
            @RequestBody RunMatchingRequest request) {
        return ResponseEntity.ok(toMatchResponses(matchingEngine.runForFilteredLostItems(request.getLostItemIds())));
    }

    @GetMapping("/my")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MatchResponseDTO>> getMyMatches(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        List<ItemMatch> matches = itemMatchRepository.findMatchesVisibleToUser(authenticatedUser.getId());
        return ResponseEntity.ok(toMatchResponses(matches));
    }

    @GetMapping("/review-queue")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MatchResponseDTO>> getReviewQueue() {
        return ResponseEntity.ok(toMatchResponses(itemMatchRepository.findByStatus(MatchStatus.PENDING_REVIEW)));
    }

    @PostMapping("/review-queue/{matchId}/approve")
    public ResponseEntity<MatchResponseDTO> approvePendingMatch(@PathVariable Long matchId) {
        ItemMatch match = getMatch(matchId);
        if (match.getStatus() != MatchStatus.PENDING_REVIEW) {
            throw new IllegalArgumentException("Match is not in PENDING_REVIEW status");
        }

        match.setStatus(MatchStatus.SUGGESTED);
        ItemMatch savedMatch = itemMatchRepository.save(match);
        matchingEngine.notifyOnSuggestedMatch(savedMatch);

        return ResponseEntity.ok(toMatchResponse(savedMatch));
    }

    @PostMapping("/review-queue/{matchId}/reject")
    public ResponseEntity<MatchResponseDTO> rejectPendingMatch(@PathVariable Long matchId) {
        ItemMatch match = getMatch(matchId);
        if (match.getStatus() != MatchStatus.PENDING_REVIEW) {
            throw new IllegalArgumentException("Match is not in PENDING_REVIEW status");
        }

        match.setStatus(MatchStatus.REJECTED);
        return ResponseEntity.ok(toMatchResponse(itemMatchRepository.save(match)));
    }

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

        return ResponseEntity.ok(toMatchResponses(matches));
    }

    @GetMapping("/{matchId}")
    @Transactional(readOnly = true)
    public ResponseEntity<MatchResponseDTO> getMatchById(@PathVariable Long matchId) {
        return ResponseEntity.ok(toMatchResponse(getMatch(matchId)));
    }

    @PostMapping("/{matchId}/confirm")
    public ResponseEntity<MatchResponseDTO> confirmMatch(@PathVariable Long matchId) {
        ItemMatch match = getMatch(matchId);
        if (match.getStatus() == MatchStatus.REJECTED) {
            throw new IllegalArgumentException("Cannot confirm a rejected match");
        }

        match.setStatus(MatchStatus.ACCEPTED);
        match.getLostItem().setStatus(ItemStatus.MATCHED);
        match.getFoundItem().setStatus(ItemStatus.MATCHED);

        itemRepository.save(match.getLostItem());
        itemRepository.save(match.getFoundItem());
        return ResponseEntity.ok(toMatchResponse(itemMatchRepository.save(match)));
    }

    @PostMapping("/{matchId}/reject")
    public ResponseEntity<MatchResponseDTO> rejectMatch(@PathVariable Long matchId) {
        ItemMatch match = getMatch(matchId);
        match.setStatus(MatchStatus.REJECTED);
        return ResponseEntity.ok(toMatchResponse(itemMatchRepository.save(match)));
    }

    private ItemMatch getMatch(Long matchId) {
        return itemMatchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found with id: " + matchId));
    }

    private List<MatchResponseDTO> toMatchResponses(List<ItemMatch> matches) {
        return matches.stream()
                .map(this::toMatchResponse)
                .collect(Collectors.toList());
    }

    private MatchResponseDTO toMatchResponse(ItemMatch match) {
        return new MatchResponseDTO(
                match.getId(),
                toItemResponse(match.getLostItem()),
                toItemResponse(match.getFoundItem()),
                match.getConfidenceScore(),
                match.getStatus(),
                match.getCreatedAt(),
                match.getUpdatedAt()
        );
    }

    private ItemResponseDTO toItemResponse(Item item) {
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
