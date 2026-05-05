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
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.ReportType;
import uom.msd.lostfound.services.ItemService;

import java.util.List;

@RestController
@RequestMapping("/items")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ItemController {

    @Autowired
    private ItemService itemService;

    /**
     * Create a new item
     * POST /items
     */
    @PostMapping
    public ResponseEntity<ItemResponseDTO> createItem(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody ItemRequestDTO request) {
        ItemResponseDTO response = itemService.createItem(authenticatedUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get item by ID
     * GET /items/{itemId}
     */
    @GetMapping("/{itemId}")
    public ResponseEntity<ItemResponseDTO> getItemById(@PathVariable Long itemId) {
        ItemResponseDTO response = itemService.getItemById(itemId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all items
     * GET /items
     */
    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> getAllItems() {
        List<ItemResponseDTO> items = itemService.getAllItems();
        return ResponseEntity.ok(items);
    }

    /**
     * Get items by report type (LOST or FOUND)
     * GET /items/type/{reportType}
     */
    @GetMapping("/type/{reportType}")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByType(
            @PathVariable ReportType reportType) {
        List<ItemResponseDTO> items = itemService.getItemsByType(reportType);
        return ResponseEntity.ok(items);
    }

    /**
     * Get items by status
     * GET /items/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByStatus(
            @PathVariable ItemStatus status) {
        List<ItemResponseDTO> items = itemService.getItemsByStatus(status);
        return ResponseEntity.ok(items);
    }

    /**
     * Get user's items
     * GET /items/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ItemResponseDTO>> getUserItems(@PathVariable Long userId) {
        List<ItemResponseDTO> items = itemService.getUserItems(userId);
        return ResponseEntity.ok(items);
    }

    /**
     * Get items by type and status
     * GET /items/filter?type=LOST&status=OPEN
     */
    @GetMapping("/filter")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByTypeAndStatus(
            @RequestParam ReportType type,
            @RequestParam ItemStatus status) {
        List<ItemResponseDTO> items = itemService.getItemsByTypeAndStatus(type, status);
        return ResponseEntity.ok(items);
    }

    /**
     * Search items by title or description
     * GET /items/search?q=keys
     */
    @GetMapping("/search")
    public ResponseEntity<List<ItemResponseDTO>> searchItems(
            @RequestParam(name = "q") String searchTerm) {
        List<ItemResponseDTO> items = itemService.searchItems(searchTerm);
        return ResponseEntity.ok(items);
    }

    /**
     * Get items by category and report type
     * GET /items/category?category=Electronics&type=LOST
     */
    @GetMapping("/category")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByCategory(
            @RequestParam String category,
            @RequestParam ReportType type) {
        List<ItemResponseDTO> items = itemService.getItemsByCategory(category, type);
        return ResponseEntity.ok(items);
    }

    /**
     * Get items by location and status
     * GET /items/location?location=Library&status=OPEN
     */
    @GetMapping("/location")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByLocation(
            @RequestParam String location,
            @RequestParam ItemStatus status) {
        List<ItemResponseDTO> items = itemService.getItemsByLocation(location, status);
        return ResponseEntity.ok(items);
    }

    /**
     * Update item status
     * PUT /items/{itemId}/status
     */
    @PutMapping("/{itemId}/status")
    public ResponseEntity<ItemResponseDTO> updateItemStatus(
            @PathVariable Long itemId,
            @RequestParam ItemStatus status) {
        ItemResponseDTO response = itemService.updateItemStatus(itemId, status);
        return ResponseEntity.ok(response);
    }

    /**
     * Add image to item
     * POST /items/{itemId}/images
     */
    @PostMapping("/{itemId}/images")
    public ResponseEntity<ItemResponseDTO> addImageToItem(
            @PathVariable Long itemId,
            @RequestBody ImageUrlRequest imageRequest) {
        ItemResponseDTO response = itemService.addImageToItem(itemId, imageRequest.getImageUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Delete item
     * DELETE /items/{itemId}
     */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        itemService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get items with pagination
     * GET /items/paginated?page=0&size=10
     */
    @GetMapping("/paginated")
    public ResponseEntity<List<ItemResponseDTO>> getItemsWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<ItemResponseDTO> items = itemService.getItemsWithPagination(page, size);
        return ResponseEntity.ok(items);
    }

    /**
     * Inner class for image URL request
     */
    public static class ImageUrlRequest {
        private String imageUrl;

        public ImageUrlRequest() {
        }

        public ImageUrlRequest(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }
}
