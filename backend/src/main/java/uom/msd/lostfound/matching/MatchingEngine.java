package uom.msd.lostfound.matching;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.MatchStatus;
import uom.msd.lostfound.enums.ReportType;
import uom.msd.lostfound.events.ItemMatchedEvent;
import uom.msd.lostfound.models.Item;
import uom.msd.lostfound.models.ItemMatch;
import uom.msd.lostfound.repositories.ItemMatchRepository;
import uom.msd.lostfound.repositories.ItemRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class MatchingEngine {

    private final ItemRepository itemRepository;
    private final ItemMatchRepository itemMatchRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.matching.threshold.suggested:0.70}")
    private double suggestedThreshold;

    @Value("${app.matching.threshold.manual-review:0.45}")
    private double manualReviewThreshold;

    @Value("${app.matching.weights.text:0.50}")
    private double weightText;

    @Value("${app.matching.weights.category:0.30}")
    private double weightCategory;

    @Value("${app.matching.weights.location:0.20}")
    private double weightLocation;

    public MatchingEngine(ItemRepository itemRepository,
                          ItemMatchRepository itemMatchRepository,
                          ApplicationEventPublisher eventPublisher) {
        this.itemRepository = itemRepository;
        this.itemMatchRepository = itemMatchRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<ItemMatch> runForFilteredLostItems(List<Long> lostItemIds) {
        if (lostItemIds == null || lostItemIds.isEmpty()) {
            return List.of();
        }

        List<ItemMatch> results = new ArrayList<>();
        for (Long lostItemId : lostItemIds) {
            results.addAll(runForFilteredLostItem(lostItemId));
        }
        return results;
    }

    public List<ItemMatch> runForFilteredLostItem(Long lostItemId) {
        Item lostItem = itemRepository.findById(lostItemId)
                .orElseThrow(() -> new IllegalArgumentException("Lost item not found with id: " + lostItemId));

        if (lostItem.getReportType() != ReportType.LOST) {
            throw new IllegalArgumentException("Matching can only be run for LOST items after admin filtering");
        }

        if (lostItem.getStatus() != ItemStatus.OPEN && lostItem.getStatus() != ItemStatus.PENDING_REVIEW) {
            return List.of();
        }

        List<Item> candidates = itemRepository.findByReportTypeAndStatus(ReportType.FOUND, ItemStatus.OPEN);
        List<ItemMatch> createdOrUpdated = new ArrayList<>();

        for (Item foundItem : candidates) {
            BigDecimal score = calculateSimilarity(lostItem, foundItem);
            double scoreValue = score.doubleValue();

            if (scoreValue < manualReviewThreshold) {
                continue;
            }

            MatchStatus status = scoreValue >= suggestedThreshold
                    ? MatchStatus.SUGGESTED
                    : MatchStatus.PENDING_REVIEW;

            ItemMatch match = upsertMatch(lostItem, foundItem, score, status);
            createdOrUpdated.add(match);

            if (status == MatchStatus.SUGGESTED) {
                notifyOnSuggestedMatch(match);
            }
        }

        return createdOrUpdated;
    }

    public BigDecimal calculateSimilarity(Item item1, Item item2) {
        String item1Text = safe(item1.getTitle()) + " " + safe(item1.getDescription());
        String item2Text = safe(item2.getTitle()) + " " + safe(item2.getDescription());
        double textSimilarity = computeJaccardSimilarity(item1Text, item2Text);

        double categorySimilarity = compareCategory(item1.getCategory(), item2.getCategory());
        double locationSimilarity = computeJaccardSimilarity(item1.getLocation(), item2.getLocation());

        double score = (textSimilarity * weightText)
                + (categorySimilarity * weightCategory)
                + (locationSimilarity * weightLocation);

        return BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP);
    }

    public void notifyOnSuggestedMatch(ItemMatch match) {
        eventPublisher.publishEvent(new ItemMatchedEvent(
                this,
                match.getLostItem().getUser().getId(),
                match.getLostItem().getUser().getEmail(),
                match.getLostItem().getTitle(),
                match.getFoundItem().getUser().getId(),
                match.getFoundItem().getUser().getEmail(),
                match.getFoundItem().getTitle(),
                match.getFoundItem().getId(),
                match.getFoundItem().getDescription(),
                match.getFoundItem().getLocation()
        ));
    }

    private ItemMatch upsertMatch(Item lostItem, Item foundItem, BigDecimal score, MatchStatus status) {
        Optional<ItemMatch> existingMatch = itemMatchRepository
                .findByLostItemIdAndFoundItemId(lostItem.getId(), foundItem.getId());

        ItemMatch match = existingMatch.orElseGet(() -> new ItemMatch(lostItem, foundItem, score));

        if (match.getStatus() == MatchStatus.ACCEPTED || match.getStatus() == MatchStatus.REJECTED) {
            return match;
        }

        match.setConfidenceScore(score);
        match.setStatus(status);
        return itemMatchRepository.save(match);
    }

    private double compareCategory(String category1, String category2) {
        if (category1 == null && category2 == null) {
            return 1.0;
        }
        if (category1 == null || category2 == null) {
            return 0.5;
        }
        return category1.trim().equalsIgnoreCase(category2.trim()) ? 1.0 : 0.0;
    }

    private double computeJaccardSimilarity(String text1, String text2) {
        Set<String> tokens1 = getCleanTokens(text1);
        Set<String> tokens2 = getCleanTokens(text2);

        if (tokens1.isEmpty() && tokens2.isEmpty()) {
            return 1.0;
        }
        if (tokens1.isEmpty() || tokens2.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(tokens1);
        intersection.retainAll(tokens2);

        Set<String> union = new HashSet<>(tokens1);
        union.addAll(tokens2);

        return (double) intersection.size() / union.size();
    }

    private Set<String> getCleanTokens(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptySet();
        }

        Set<String> stopWords = Set.of(
                "a", "an", "the", "and", "or", "but", "is", "are", "was", "were",
                "in", "on", "at", "to", "for", "with", "my", "your", "of", "it",
                "this", "that", "i", "you", "he", "she"
        );

        Set<String> tokens = new HashSet<>();
        String[] rawTokens = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").split("\\s+");
        for (String rawToken : rawTokens) {
            String token = rawToken.trim();
            if (!token.isEmpty() && !stopWords.contains(token)) {
                tokens.add(token);
            }
        }
        return tokens;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
