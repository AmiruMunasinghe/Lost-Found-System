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
import org.springframework.context.ApplicationEventPublisher;
import uom.msd.lostfound.events.ItemCreatedEvent;
import uom.msd.lostfound.repositories.ItemRepository;
import uom.msd.lostfound.repositories.UserRepository;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemServiceImpl implements ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    public ItemResponseDTO createItem(Long userId, ItemRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Item item = new Item(user, request.getTitle(), request.getReportType());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setLocation(request.getLocation());
        item.setStatus(ItemStatus.PENDING_REVIEW);

        // Add images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (String imageUrl : request.getImageUrls()) {
                ItemImage image = new ItemImage(item, imageUrl);
                item.addImage(image);
            }
        }

        Item savedItem = itemRepository.save(item);
        eventPublisher.publishEvent(new ItemCreatedEvent(this, savedItem));
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
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return List.of();
        }

        String normalizedTerm = normalize(searchTerm);
        List<String> keywords = Arrays.stream(normalizedTerm.split("\\s+"))
            .filter(term -> !term.isBlank())
            .distinct()
            .collect(Collectors.toList());

        return itemRepository.searchByKeyword(normalizedTerm).stream()
            .sorted(Comparator
                .comparingInt((Item item) -> calculateRelevanceScore(item, normalizedTerm, keywords))
                .reversed()
                .thenComparing(Item::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(Item::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
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

    private int calculateRelevanceScore(Item item, String normalizedTerm, List<String> keywords) {
        int score = 0;

        String title = normalize(item.getTitle());
        String description = normalize(item.getDescription());
        String category = normalize(item.getCategory());
        String location = normalize(item.getLocation());

        if (title.equals(normalizedTerm)) {
            score += 300;
        } else if (title.contains(normalizedTerm)) {
            score += 180;
        }

        if (description.contains(normalizedTerm)) {
            score += 90;
        }

        if (category.contains(normalizedTerm) || location.contains(normalizedTerm)) {
            score += 70;
        }

        for (String keyword : keywords) {
            if (title.startsWith(keyword)) {
                score += 50;
            } else if (title.contains(keyword)) {
                score += 30;
            }

            if (description.contains(keyword)) {
                score += 15;
            }

            if (category.contains(keyword) || location.contains(keyword)) {
                score += 10;
            }
        }

        return score;
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).trim();
    }
}
