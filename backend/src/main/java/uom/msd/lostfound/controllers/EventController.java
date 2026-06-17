package uom.msd.lostfound.controllers;

import uom.msd.lostfound.events.FoundItemSubmittedEvent;
import uom.msd.lostfound.events.ItemClaimedEvent;
import uom.msd.lostfound.events.ItemMatchedEvent;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Allows other microservices / modules to trigger events in this module via REST.
 * This is the integration point that replaces an external message queue.
 */
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class EventController {

    private final ApplicationEventPublisher eventPublisher;

    /**
     * POST /api/events/item-matched
     * Called by the matching service when a lost item matches a found item.
     */
    @PostMapping("/item-matched")
    public ResponseEntity<Void> itemMatched(@Valid @RequestBody ItemMatchedPayload payload) {
        eventPublisher.publishEvent(new ItemMatchedEvent(
                this,
                payload.getLostItemOwnerId(),
                payload.getLostItemOwnerEmail(),
                payload.getLostItemName(),
                payload.getFoundItemId(),
                payload.getFoundItemDescription(),
                payload.getFoundLocation()
        ));
        return ResponseEntity.accepted().build();
    }

    /**
     * POST /api/events/found-item-submitted
     * Called by the found item module when a user submits a found item.
     */
    @PostMapping("/found-item-submitted")
    public ResponseEntity<Void> foundItemSubmitted(
            @Valid @RequestBody FoundItemPayload payload) {
        eventPublisher.publishEvent(new FoundItemSubmittedEvent(
                this,
                payload.getFinderId(),
                payload.getFinderEmail(),
                payload.getFoundItemId(),
                payload.getItemName()
        ));
        return ResponseEntity.accepted().build();
    }

    /**
     * POST /api/events/item-claimed
     * Called when an item is claimed and returned to its owner.
     */
    @PostMapping("/item-claimed")
    public ResponseEntity<Void> itemClaimed(@Valid @RequestBody ItemClaimedPayload payload) {
        eventPublisher.publishEvent(new ItemClaimedEvent(
                this,
                payload.getOwnerId(),
                payload.getOwnerEmail(),
                payload.getFinderId(),
                payload.getFinderEmail(),
                payload.getItemId(),
                payload.getItemName()
        ));
        return ResponseEntity.accepted().build();
    }

    // ─── Request payload inner classes ───────────────────────────────────────

    @Data
    public static class ItemMatchedPayload {
        @NotNull  private Long lostItemOwnerId;
        @NotBlank private String lostItemOwnerEmail;
        @NotBlank private String lostItemName;
        @NotNull  private Long foundItemId;
        @NotBlank private String foundItemDescription;
        @NotBlank private String foundLocation;
    }

    @Data
    public static class FoundItemPayload {
        @NotNull  private Long finderId;
        @NotBlank private String finderEmail;
        @NotNull  private Long foundItemId;
        @NotBlank private String itemName;
    }

    @Data
    public static class ItemClaimedPayload {
        @NotNull  private Long ownerId;
        @NotBlank private String ownerEmail;
        private Long finderId;
        private String finderEmail;
        @NotNull  private Long itemId;
        @NotBlank private String itemName;
    }
}
