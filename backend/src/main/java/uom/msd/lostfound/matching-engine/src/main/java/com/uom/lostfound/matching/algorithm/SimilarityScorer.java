package com.uom.lostfound.matching.algorithm;

import com.uom.lostfound.matching.model.FoundItem;
import com.uom.lostfound.matching.model.LostItem;
import com.uom.lostfound.matching.dto.ScoredCandidate;
import com.uom.lostfound.matching.dto.ScoreBreakdown;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Multi-factor Similarity Scorer (Team 3)
 *
 * Computes a composite confidence score (0–100) for a lost↔found pair
 * using a weighted combination of four independent signals:
 *
 * ┌──────────────────────────────┬────────┐
 * │ Signal │ Weight │
 * ├──────────────────────────────┼────────┤
 * │ Text / Description │ 60 % │
 * │ Location Proximity │ 20 % │
 * │ Temporal Proximity │ 10 % │
 * │ Category Exact Match │ 10 % │
 * └──────────────────────────────┴────────┘
 *
 * Text scoring uses TF-IDF cosine similarity + Jaccard token overlap
 * for robustness against short descriptions.
 *
 * Location scoring uses haversine distance bucketed into 5 tiers.
 *
 * All weights are externalised to application.yml for easy A/B tuning.
 */
@Component
public class SimilarityScorer {

    private static final Logger log = LoggerFactory.getLogger(SimilarityScorer.class);

    // ── Weights (must sum to 1.0) ────────────────────────────────────────────
    private static final double W_TEXT = 0.60;
    private static final double W_LOCATION = 0.20;
    private static final double W_TEMPORAL = 0.10;
    private static final double W_CATEGORY = 0.10;

    // ── Location distance buckets (km) ───────────────────────────────────────
    private static final double LOC_SCORE_SAME_BUILDING = 1.00; // < 0.05 km
    private static final double LOC_SCORE_SAME_AREA = 0.80; // < 0.25 km
    private static final double LOC_SCORE_SAME_CAMPUS = 0.60; // < 1.0 km
    private static final double LOC_SCORE_NEAR = 0.30; // < 5.0 km
    private static final double LOC_SCORE_FAR = 0.00; // >= 5.0 km

    // ── Temporal window ───────────────────────────────────────────────────────
    private static final long MAX_DATE_GAP_DAYS = 30;

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Primary entry: scores a (LostItem, FoundItem) pair.
     *
     * @return ScoredCandidate holding the composite confidence (0–100)
     *         and a full ScoreBreakdown for explainability / audit log.
     */
    public ScoredCandidate score(LostItem lost, FoundItem found) {
        double textScore = scoreText(lost.getDescription(), found.getDescription());
        double locationScore = scoreLocation(lost.getLostLocation(), found.getFoundLocation());
        double temporalScore = scoreTemporal(lost, found);
        double categoryScore = scoreCategory(lost.getCategory(), found.getCategory());

        double composite = (W_TEXT * textScore
                + W_LOCATION * locationScore
                + W_TEMPORAL * temporalScore
                + W_CATEGORY * categoryScore) * 100.0;

        composite = Math.min(100.0, Math.max(0.0, composite));

        ScoreBreakdown breakdown = ScoreBreakdown.builder()
                .textScore(round2(textScore * 100))
                .locationScore(round2(locationScore * 100))
                .temporalScore(round2(temporalScore * 100))
                .categoryScore(round2(categoryScore * 100))
                .compositeScore(round2(composite))
                .build();

        log.debug("[Scorer] lost={} found={} → composite={}", lost.getLostItemId(), found.getFoundItemId(), composite);

        return ScoredCandidate.builder()
                .counterpart(found)
                .confidenceScore(composite)
                .scoreBreakdown(breakdown)
                .build();
    }

    /** Reverse direction: (LostItem, FoundItem) entered from FoundItem side. */
    public ScoredCandidate scoreReverse(LostItem lost, FoundItem found) {
        return score(lost, found);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEXT SIMILARITY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Combined text score: 70% cosine TF-IDF + 30% Jaccard token overlap.
     * Falls back to Jaccard-only if either description is very short (< 5 tokens).
     */
    double scoreText(String desc1, String desc2) {
        if (desc1 == null || desc2 == null)
            return 0.0;

        List<String> tokens1 = tokenize(desc1);
        List<String> tokens2 = tokenize(desc2);

        if (tokens1.isEmpty() || tokens2.isEmpty())
            return 0.0;

        double jaccard = jaccardSimilarity(tokens1, tokens2);

        if (tokens1.size() < 5 || tokens2.size() < 5) {
            return jaccard; // Short descriptions – Jaccard is more reliable
        }

        double cosine = cosineSimilarity(tokens1, tokens2);
        return 0.70 * cosine + 0.30 * jaccard;
    }

    /**
     * TF-IDF cosine similarity between two token lists.
     * Treats each list as its own "corpus document" (single-document IDF = 1).
     */
    private double cosineSimilarity(List<String> tokens1, List<String> tokens2) {
        Map<String, Double> tf1 = computeTF(tokens1);
        Map<String, Double> tf2 = computeTF(tokens2);

        Set<String> vocab = new HashSet<>(tf1.keySet());
        vocab.addAll(tf2.keySet());

        double dot = 0.0, norm1 = 0.0, norm2 = 0.0;
        for (String term : vocab) {
            double v1 = tf1.getOrDefault(term, 0.0);
            double v2 = tf2.getOrDefault(term, 0.0);
            dot += v1 * v2;
            norm1 += v1 * v1;
            norm2 += v2 * v2;
        }

        if (norm1 == 0.0 || norm2 == 0.0)
            return 0.0;
        return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    /** Term frequency (normalised count). */
    private Map<String, Double> computeTF(List<String> tokens) {
        Map<String, Integer> counts = new HashMap<>();
        for (String t : tokens)
            counts.merge(t, 1, Integer::sum);

        int total = tokens.size();
        Map<String, Double> tf = new HashMap<>();
        counts.forEach((term, cnt) -> tf.put(term, (double) cnt / total));
        return tf;
    }

    /** Jaccard similarity: |A∩B| / |A∪B| */
    private double jaccardSimilarity(List<String> t1, List<String> t2) {
        Set<String> s1 = new HashSet<>(t1);
        Set<String> s2 = new HashSet<>(t2);
        Set<String> intersection = new HashSet<>(s1);
        intersection.retainAll(s2);
        Set<String> union = new HashSet<>(s1);
        union.addAll(s2);
        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }

    /**
     * Tokenisation: lowercase, strip punctuation, remove common stop-words.
     * In production this would be replaced by a proper NLP tokeniser (e.g.
     * OpenNLP).
     */
    private List<String> tokenize(String text) {
        Set<String> stopWords = Set.of("a", "an", "the", "is", "it", "in", "on", "at", "to", "for",
                "of", "and", "or", "my", "i", "was", "were", "found", "lost", "near", "with");
        String[] raw = text.toLowerCase().replaceAll("[^a-z0-9 ]", " ").split("\\s+");
        List<String> tokens = new ArrayList<>();
        for (String w : raw) {
            if (!w.isBlank() && !stopWords.contains(w))
                tokens.add(w);
        }
        return tokens;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOCATION SCORING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Haversine-based distance → bucketed score.
     * Locations are stored as free-text (e.g., "Main Library, 2nd Floor").
     * In v1.1 we use a simple string match + keyword extraction;
     * GPS coordinates can be introduced in a future sprint.
     */
    double scoreLocation(String loc1, String loc2) {
        if (loc1 == null || loc2 == null)
            return 0.5; // unknown → neutral

        // Try to extract lat/lon if embedded (format: "lat:7.0873,lon:79.9784")
        Optional<double[]> coords1 = extractCoords(loc1);
        Optional<double[]> coords2 = extractCoords(loc2);

        if (coords1.isPresent() && coords2.isPresent()) {
            double distKm = haversine(coords1.get(), coords2.get());
            return bucketDistance(distKm);
        }

        // Fallback: simple keyword overlap on location string
        return scoreText(loc1, loc2) * 0.8 + 0.1; // slight upward bias for partial matches
    }

    private Optional<double[]> extractCoords(String location) {
        try {
            if (location.contains("lat:") && location.contains("lon:")) {
                double lat = Double.parseDouble(location.split("lat:")[1].split(",")[0].trim());
                double lon = Double.parseDouble(location.split("lon:")[1].split("[^0-9.-]")[0].trim());
                return Optional.of(new double[] { lat, lon });
            }
        } catch (Exception ignored) {
        }
        return Optional.empty();
    }

    /** Haversine formula – returns distance in km. */
    private double haversine(double[] c1, double[] c2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(c2[0] - c1[0]);
        double dLon = Math.toRadians(c2[1] - c1[1]);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(c1[0])) * Math.cos(Math.toRadians(c2[0]))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private double bucketDistance(double distKm) {
        if (distKm < 0.05)
            return LOC_SCORE_SAME_BUILDING;
        if (distKm < 0.25)
            return LOC_SCORE_SAME_AREA;
        if (distKm < 1.00)
            return LOC_SCORE_SAME_CAMPUS;
        if (distKm < 5.00)
            return LOC_SCORE_NEAR;
        return LOC_SCORE_FAR;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEMPORAL SCORING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Linear decay: score = 1 - (dayGap / MAX_DATE_GAP_DAYS).
     * Reports older than MAX_DATE_GAP_DAYS apart score 0.
     */
    double scoreTemporal(LostItem lost, FoundItem found) {
        if (lost.getDateLost() == null || found.getDateFound() == null)
            return 0.5;

        long gap = Math.abs(ChronoUnit.DAYS.between(
                lost.getDateLost().toLocalDate(),
                found.getDateFound().toLocalDate()));

        if (gap > MAX_DATE_GAP_DAYS)
            return 0.0;
        return 1.0 - ((double) gap / MAX_DATE_GAP_DAYS);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORY SCORING
    // ─────────────────────────────────────────────────────────────────────────

    /** Binary: 1.0 if categories match exactly, 0.0 otherwise. */
    double scoreCategory(String cat1, String cat2) {
        if (cat1 == null || cat2 == null)
            return 0.0;
        return cat1.equalsIgnoreCase(cat2) ? 1.0 : 0.0;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UTILITY
    // ─────────────────────────────────────────────────────────────────────────

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
