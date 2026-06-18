package uom.msd.lostfound.controllers;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import uom.msd.lostfound.auth.AuthenticatedUser;
import uom.msd.lostfound.dto.ItemRequestDTO;
import uom.msd.lostfound.dto.ItemResponseDTO;
import uom.msd.lostfound.dto.SendNotificationRequest;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.NotificationChannel;
import uom.msd.lostfound.enums.NotificationType;
import uom.msd.lostfound.enums.ReportType;
import uom.msd.lostfound.matching.MatchingEngine;
import uom.msd.lostfound.services.ItemService;
import uom.msd.lostfound.services.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/items")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private MatchingEngine matchingEngine;

    @Autowired
    private NotificationService notificationService;

    /**
     * Create a new item. New user reports are held for admin approval first.
     * POST /items
     */
    @PostMapping
    public ResponseEntity<ItemResponseDTO> createItem(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody ItemRequestDTO request) {
        ItemResponseDTO response = itemService.createItem(authenticatedUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<ItemResponseDTO> getItemById(@PathVariable Long itemId) {
        return ResponseEntity.ok(itemService.getItemById(itemId));
    }

    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/type/{reportType}")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByType(@PathVariable ReportType reportType) {
        return ResponseEntity.ok(itemService.getItemsByType(reportType));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByStatus(@PathVariable ItemStatus status) {
        return ResponseEntity.ok(itemService.getItemsByStatus(status));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ItemResponseDTO>> getUserItems(@PathVariable Long userId) {
        return ResponseEntity.ok(itemService.getUserItems(userId));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByTypeAndStatus(
            @RequestParam ReportType type,
            @RequestParam ItemStatus status) {
        return ResponseEntity.ok(itemService.getItemsByTypeAndStatus(type, status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ItemResponseDTO>> searchItems(@RequestParam(name = "q") String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(List.of());
        }
        return ResponseEntity.ok(itemService.searchItems(searchTerm));
    }

    @GetMapping("/category")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByCategory(
            @RequestParam String category,
            @RequestParam ReportType type) {
        return ResponseEntity.ok(itemService.getItemsByCategory(category, type));
    }

    @GetMapping("/location")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByLocation(
            @RequestParam String location,
            @RequestParam ItemStatus status) {
        return ResponseEntity.ok(itemService.getItemsByLocation(location, status));
    }

    /**
     * Admin uses this endpoint for report approval/rejection.
     * PUT /items/{itemId}/status?status=OPEN approves report.
     * PUT /items/{itemId}/status?status=CLOSED rejects/closes report.
     */
    @PutMapping("/{itemId}/status")
    public ResponseEntity<ItemResponseDTO> updateItemStatus(
            @PathVariable Long itemId,
            @RequestParam ItemStatus status) {
        ItemResponseDTO response = itemService.updateItemStatus(itemId, status);

        if (status == ItemStatus.OPEN) {
            notifyUser(response, "Report Approved: " + response.getTitle(),
                    "Your " + response.getReportType() + " report '" + response.getTitle() +
                            "' has been approved by the admin. Matching will run automatically where applicable.");
            runMatchingAfterApproval(response);
        } else if (status == ItemStatus.CLOSED) {
            notifyUser(response, "Report Closed: " + response.getTitle(),
                    "Your report '" + response.getTitle() + "' has been closed by the admin. Contact admin if you need clarification.");
        }

        return ResponseEntity.ok(response);
    }

    private void runMatchingAfterApproval(ItemResponseDTO approvedItem) {
        try {
            if (approvedItem.getReportType() == ReportType.LOST) {
                matchingEngine.runForFilteredLostItem(approvedItem.getId());
            } else if (approvedItem.getReportType() == ReportType.FOUND) {
                List<ItemResponseDTO> approvedLostItems = itemService.getItemsByTypeAndStatus(ReportType.LOST, ItemStatus.OPEN);
                List<Long> lostIds = approvedLostItems.stream().map(ItemResponseDTO::getId).toList();
                matchingEngine.runForFilteredLostItems(lostIds);
            }
        } catch (Exception ex) {
            System.err.println("Matching after approval failed for item " + approvedItem.getId() + ": " + ex.getMessage());
        }
    }

    private void notifyUser(ItemResponseDTO item, String title, String message) {
        try {
            SendNotificationRequest request = new SendNotificationRequest();
            request.setUserId(item.getUserId());
            request.setType(NotificationType.GENERAL);
            request.setTitle(title);
            request.setMessage(message);
            request.setChannel(NotificationChannel.IN_APP);
            request.setReferenceItemId(item.getId());
            notificationService.sendNotification(request);
        } catch (Exception ex) {
            System.err.println("Notification failed for item " + item.getId() + ": " + ex.getMessage());
        }
    }

    @PostMapping("/{itemId}/images")
    public ResponseEntity<ItemResponseDTO> addImageToItem(
            @PathVariable Long itemId,
            @RequestBody ImageUrlRequest imageRequest) {
        ItemResponseDTO response = itemService.addImageToItem(itemId, imageRequest.getImageUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        if (itemId == null) return ResponseEntity.badRequest().build();
        itemService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/paginated")
    public ResponseEntity<List<ItemResponseDTO>> getItemsWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (page < 0) page = 0;
        if (size <= 0) size = 10;
        if (size > 50) size = 50;
        return ResponseEntity.ok(itemService.getItemsWithPagination(page, size));
    }

    public static class ImageUrlRequest {
        private String imageUrl;
        public ImageUrlRequest() {}
        public ImageUrlRequest(String imageUrl) { this.imageUrl = imageUrl; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
}
