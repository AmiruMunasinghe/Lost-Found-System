package uom.msd.lostfound.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uom.msd.lostfound.dto.ItemRequestDTO;
import uom.msd.lostfound.dto.ItemResponseDTO;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.ReportType;
import uom.msd.lostfound.models.Item;
import uom.msd.lostfound.models.ItemImage;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.ItemRepository;
import uom.msd.lostfound.repositories.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemServiceImpl implements ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public ItemResponseDTO createItem(Long userId, ItemRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Item item = new Item(user, request.getTitle(), request.getReportType());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setLocation(request.getLocation());

        // Add images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (String imageUrl : request.getImageUrls()) {
                ItemImage image = new ItemImage(item, imageUrl);
                item.addImage(image);
            }
        }

        Item savedItem = itemRepository.save(item);
        return convertToResponseDTO(savedItem);
    }

    @Override
    @Transactional(readOnly = true)
    public ItemResponseDTO getItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemId));
        return convertToResponseDTO(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getAllItems() {
        return itemRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getItemsByType(ReportType reportType) {
        return itemRepository.findByReportType(reportType).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getItemsByStatus(ItemStatus status) {
        return itemRepository.findByStatus(status).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getUserItems(Long userId) {
        return itemRepository.findByUserId(userId).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getItemsByTypeAndStatus(ReportType reportType, ItemStatus status) {
        return itemRepository.findByReportTypeAndStatus(reportType, status).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> searchItems(String searchTerm) {
        return itemRepository.searchByTitleOrDescription(searchTerm).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getItemsByCategory(String category, ReportType reportType) {
        return itemRepository.findBysCategoryAndType(category, reportType).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getItemsByLocation(String location, ItemStatus status) {
        return itemRepository.findByLocationAndStatus(location, status).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ItemResponseDTO updateItemStatus(Long itemId, ItemStatus newStatus) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemId));
        item.setStatus(newStatus);
        Item updatedItem = itemRepository.save(item);
        return convertToResponseDTO(updatedItem);
    }

    @Override
    public void deleteItem(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemId));
        itemRepository.delete(item);
    }

    @Override
    public ItemResponseDTO addImageToItem(Long itemId, String imageUrl) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemId));
        ItemImage image = new ItemImage(item, imageUrl);
        item.addImage(image);
        Item updatedItem = itemRepository.save(item);
        return convertToResponseDTO(updatedItem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getItemsWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return itemRepository.findAll(pageable).getContent().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert Item entity to ItemResponseDTO
     */
    private ItemResponseDTO convertToResponseDTO(Item item) {
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
