package uom.msd.lostfound.services;

import uom.msd.lostfound.dto.ItemRequestDTO;
import uom.msd.lostfound.dto.ItemResponseDTO;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.ReportType;

import java.util.List;

public interface ItemService {

    /**
     * Create a new item with the provided details and images
     */
    ItemResponseDTO createItem(Long userId, ItemRequestDTO request);

    /**
     * Get an item by ID
     */
    ItemResponseDTO getItemById(Long itemId);

    /**
     * Get all items
     */
    List<ItemResponseDTO> getAllItems();

    /**
     * Get items by report type (LOST or FOUND)
     */
    List<ItemResponseDTO> getItemsByType(ReportType reportType);

    /**
     * Get items by status
     */
    List<ItemResponseDTO> getItemsByStatus(ItemStatus status);

    /**
     * Get items by user ID
     */
    List<ItemResponseDTO> getUserItems(Long userId);

    /**
     * Get items by report type and status
     */
    List<ItemResponseDTO> getItemsByTypeAndStatus(ReportType reportType, ItemStatus status);

    /**
     * Search items by title or description
     */
    List<ItemResponseDTO> searchItems(String searchTerm);

    /**
     * Get items by category and type
     */
    List<ItemResponseDTO> getItemsByCategory(String category, ReportType reportType);

    /**
     * Get items by location and status
     */
    List<ItemResponseDTO> getItemsByLocation(String location, ItemStatus status);

    /**
     * Update item status
     */
    ItemResponseDTO updateItemStatus(Long itemId, ItemStatus newStatus);

    /**
     * Delete an item
     */
    void deleteItem(Long itemId);

    /**
     * Add image to an existing item
     */
    ItemResponseDTO addImageToItem(Long itemId, String imageUrl);

    /**
     * Get items with pagination
     */
    List<ItemResponseDTO> getItemsWithPagination(int page, int size);
}
