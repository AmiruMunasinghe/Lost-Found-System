package uom.msd.lostfound.matching;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.MatchStatus;
import uom.msd.lostfound.enums.ReportType;
import uom.msd.lostfound.events.ItemCreatedEvent;
import uom.msd.lostfound.events.ItemMatchedEvent;
import uom.msd.lostfound.models.Item;
import uom.msd.lostfound.models.ItemMatch;
import uom.msd.lostfound.repositories.ItemMatchRepository;
import uom.msd.lostfound.repositories.ItemRepository;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MatchingEngine {

    private final ItemRepository itemRepository;
    private final ItemMatchRepository itemMatchRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.matching.threshold.auto-accept:0.70}")
    private double autoAcceptThreshold;

    @Value("${app.matching.threshold.manual-review:0.45}")
    private double manualReviewThreshold;

    @Value("${app.matching.weights.text:0.50}")
    private double weightText;

    @Value("${app.matching.weights.category:0.30}")
    private double weightCategory;

    @Value("${app.matching.weights.location:0.20}")
    private double weightLocation;

    @Async
    @EventListener
    public void handleItemCreated(ItemCreatedEvent event) {
        log.info("MatchingEngine received ItemCreatedEvent for item id={}", event.getItem().getId());
        triggerMatching(event.getItem().getId());
    }

    public void triggerMatching(Long itemId) {
        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null || item.getStatus() != ItemStatus.OPEN) {
            return;
        }

        ReportType oppositeType = (item.getReportType() == ReportType.LOST) ? ReportType.FOUND : ReportType.LOST;
        List<Item> candidates = itemRepository.findByReportTypeAndStatus(oppositeType, ItemStatus.OPEN);

        log.info("Running matching for item id={} of type {}. Found {} candidate items.", 
                itemId, item.getReportType(), candidates.size());

        for (Item candidate : candidates) {
            BigDecimal score = calculateSimilarity(item, candidate);
            double scoreVal = score.doubleValue();

            if (scoreVal >= manualReviewThreshold) {
                Item lostItem = (item.getReportType() == ReportType.LOST) ? item : candidate;
                Item foundItem = (item.getReportType() == ReportType.LOST) ? candidate : item;

                Optional<ItemMatch> existingMatchOpt = itemMatchRepository
                        .findByLostItemIdAndFoundItemId(lostItem.getId(), foundItem.getId());

                if (existingMatchOpt.isPresent()) {
                    ItemMatch existingMatch = existingMatchOpt.get();
                    if (existingMatch.getStatus() == MatchStatus.SUGGESTED || existingMatch.getStatus() == MatchStatus.PENDING_REVIEW) {
                        existingMatch.setConfidenceScore(score);
                        MatchStatus newStatus = (scoreVal >= autoAcceptThreshold) ? MatchStatus.SUGGESTED : MatchStatus.PENDING_REVIEW;
                        existingMatch.setStatus(newStatus);
                        itemMatchRepository.save(existingMatch);
                        if (newStatus == MatchStatus.SUGGESTED) {
                            notifyOnHighMatch(existingMatch);
                        }
                    }
                } else {
                    ItemMatch match = new ItemMatch(lostItem, foundItem, score);
                    MatchStatus newStatus = (scoreVal >= autoAcceptThreshold) ? MatchStatus.SUGGESTED : MatchStatus.PENDING_REVIEW;
                    match.setStatus(newStatus);
                    itemMatchRepository.save(match);
                    
                    if (newStatus == MatchStatus.SUGGESTED) {
                        notifyOnHighMatch(match);
                    }
                }
            }
        }
    }

    public BigDecimal calculateSimilarity(Item item1, Item item2) {
        // Text similarity (Title + Description)
        String s1Text = item1.getTitle() + " " + (item1.getDescription() != null ? item1.getDescription() : "");
        String s2Text = item2.getTitle() + " " + (item2.getDescription() != null ? item2.getDescription() : "");
        double textSim = computeJaccardSimilarity(s1Text, s2Text);

        // Category similarity
        double categorySim = 0.0;
        if (item1.getCategory() != null && item2.getCategory() != null) {
            categorySim = item1.getCategory().trim().equalsIgnoreCase(item2.getCategory().trim()) ? 1.0 : 0.0;
        } else if (item1.getCategory() == null && item2.getCategory() == null) {
            categorySim = 1.0;
        } else {
            categorySim = 0.5;
        }

        // Location similarity
        double locationSim = 0.0;
        if (item1.getLocation() != null && item2.getLocation() != null) {
            locationSim = computeJaccardSimilarity(item1.getLocation(), item2.getLocation());
        } else if (item1.getLocation() == null && item2.getLocation() == null) {
            locationSim = 1.0;
        } else {
            locationSim = 0.5;
        }

        double score = (textSim * weightText) + (categorySim * weightCategory) + (locationSim * weightLocation);
        return BigDecimal.valueOf(score).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private double computeJaccardSimilarity(String s1, String s2) {
        Set<String> tokens1 = getCleanTokens(s1);
        Set<String> tokens2 = getCleanTokens(s2);
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
        if (text == null) return Collections.emptySet();
        String[] rawTokens = text.toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", " ").split("\\s+");
        Set<String> stopWords = Set.of(
            "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "in", "on", "at", 
            "to", "for", "with", "my", "your", "of", "it", "this", "that", "i", "you", "he", "she"
        );
        Set<String> tokens = new HashSet<>();
        for (String raw : rawTokens) {
            String trimmed = raw.trim();
            if (!trimmed.isEmpty() && !stopWords.contains(trimmed)) {
                tokens.add(trimmed);
            }
        }
        return tokens;
    }

    public void notifyOnHighMatch(ItemMatch match) {
        log.info("High similarity match found between lost item id={} and found item id={}! Notifying owners.",
                match.getLostItem().getId(), match.getFoundItem().getId());

        eventPublisher.publishEvent(new ItemMatchedEvent(
                this,
                match.getLostItem().getUser().getId(),
                match.getLostItem().getUser().getEmail(),
                match.getLostItem().getTitle(),
                match.getFoundItem().getId(),
                match.getFoundItem().getDescription(),
                match.getFoundItem().getLocation()
        ));
    }
}
