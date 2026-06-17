package com.uom.lostfound.matching;

import com.uom.lostfound.matching.algorithm.SimilarityScorer;
import com.uom.lostfound.matching.model.FoundItem;
import com.uom.lostfound.matching.model.LostItem;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for SimilarityScorer (Team 3)
 *
 * Covers:
 *  - Text similarity edge cases (null, empty, identical, disjoint)
 *  - Location scoring (same building, same campus, GPS coordinates)
 *  - Temporal scoring (same day, within window, outside window)
 *  - Category scoring (match / mismatch)
 *  - Composite score range invariant [0, 100]
 */
@DisplayName("SimilarityScorer Unit Tests")
class SimilarityScorerTest {

    private SimilarityScorer scorer;

    @BeforeEach
    void setUp() {
        scorer = new SimilarityScorer();
    }

    // ── Text Scoring ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("Identical descriptions should score 1.0")
    void textScore_identical_shouldBeOne() {
        double score = scorer.scoreText("black leather wallet with student ID", "black leather wallet with student ID");
        assertThat(score).isEqualTo(1.0);
    }

    @Test
    @DisplayName("Completely disjoint descriptions should score 0")
    void textScore_disjoint_shouldBeZero() {
        double score = scorer.scoreText("blue umbrella rain", "red laptop dell charger");
        assertThat(score).isLessThanOrEqualTo(0.05);
    }

    @Test
    @DisplayName("Null description should return 0")
    void textScore_null_shouldReturnZero() {
        assertThat(scorer.scoreText(null, "some description")).isEqualTo(0.0);
        assertThat(scorer.scoreText("some description", null)).isEqualTo(0.0);
    }

    @ParameterizedTest(name = "desc1=''{0}'' vs desc2=''{1}'' → score>={2}")
    @CsvSource({
        "'black leather wallet near main library', 'black wallet found library entrance', 0.4",
        "'samsung phone galaxy lost canteen',       'samsung galaxy s23 found canteen area', 0.35",
        "'blue backpack nirvana band logo',         'blue bag nirvana logo front pocket',    0.30"
    })
    @DisplayName("Semantically similar descriptions should score above threshold")
    void textScore_similar_shouldExceedThreshold(String d1, String d2, double threshold) {
        assertThat(scorer.scoreText(d1, d2)).isGreaterThan(threshold);
    }

    // ── Location Scoring ─────────────────────────────────────────────────────

    @Test
    @DisplayName("GPS coords in same building (<50m) should score 1.0")
    void locationScore_sameBuilding_shouldScore100pct() {
        String loc1 = "lat:6.7960,lon:79.9006";
        String loc2 = "lat:6.7961,lon:79.9007";
        double score = scorer.scoreLocation(loc1, loc2);
        assertThat(score).isEqualTo(1.0);
    }

    @Test
    @DisplayName("Null locations should return neutral 0.5")
    void locationScore_null_shouldReturnNeutral() {
        assertThat(scorer.scoreLocation(null, "Main Library")).isEqualTo(0.5);
    }

    // ── Temporal Scoring ─────────────────────────────────────────────────────

    @Test
    @DisplayName("Same date lost and found should score 1.0")
    void temporalScore_sameDay_shouldBeOne() {
        LostItem lost   = buildLost("Electronics", LocalDateTime.now());
        FoundItem found = buildFound("Electronics", LocalDateTime.now());
        assertThat(scorer.scoreTemporal(lost, found)).isEqualTo(1.0);
    }

    @Test
    @DisplayName("Gap > 30 days should score 0")
    void temporalScore_beyond30Days_shouldBeZero() {
        LostItem lost   = buildLost("Electronics", LocalDateTime.now().minusDays(31));
        FoundItem found = buildFound("Electronics", LocalDateTime.now());
        assertThat(scorer.scoreTemporal(lost, found)).isEqualTo(0.0);
    }

    @Test
    @DisplayName("15-day gap should score ~0.5")
    void temporalScore_halfWindow_shouldBeHalf() {
        LostItem lost   = buildLost("Electronics", LocalDateTime.now().minusDays(15));
        FoundItem found = buildFound("Electronics", LocalDateTime.now());
        assertThat(scorer.scoreTemporal(lost, found)).isCloseTo(0.5, within(0.05));
    }

    // ── Category Scoring ─────────────────────────────────────────────────────

    @Test
    @DisplayName("Matching categories should score 1.0")
    void categoryScore_match_shouldBeOne() {
        assertThat(scorer.scoreCategory("Electronics", "Electronics")).isEqualTo(1.0);
    }

    @Test
    @DisplayName("Mismatched categories should score 0.0")
    void categoryScore_mismatch_shouldBeZero() {
        assertThat(scorer.scoreCategory("Books", "Electronics")).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Case-insensitive category match should score 1.0")
    void categoryScore_caseInsensitive_shouldBeOne() {
        assertThat(scorer.scoreCategory("electronics", "ELECTRONICS")).isEqualTo(1.0);
    }

    // ── Composite Score ───────────────────────────────────────────────────────

    @Test
    @DisplayName("Composite score should always be in range [0, 100]")
    void compositeScore_shouldBeInRange() {
        LostItem lost   = buildLost("Books", LocalDateTime.now().minusDays(5));
        FoundItem found = buildFound("Electronics", LocalDateTime.now());
        lost.setDescription("black backpack with books");
        found.setDescription("red suitcase with clothes");

        var result = scorer.score(lost, found);
        assertThat(result.getConfidenceScore()).isBetween(0.0, 100.0);
    }

    @Test
    @DisplayName("Perfect match (same desc, location, date, category) should score ~100")
    void compositeScore_perfect_shouldBeNear100() {
        LocalDateTime now = LocalDateTime.now();
        LostItem lost = buildLost("Electronics", now);
        lost.setDescription("samsung galaxy s23 black phone lost canteen");
        lost.setLostLocation("lat:6.7960,lon:79.9006");

        FoundItem found = buildFound("Electronics", now);
        found.setDescription("samsung galaxy s23 black phone lost canteen");
        found.setFoundLocation("lat:6.7961,lon:79.9007");

        var result = scorer.score(lost, found);
        assertThat(result.getConfidenceScore()).isGreaterThanOrEqualTo(85.0);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private LostItem buildLost(String category, LocalDateTime dateLost) {
        LostItem item = new LostItem();
        item.setLostItemId(UUID.randomUUID());
        item.setCategory(category);
        item.setDateLost(dateLost);
        item.setDescription("generic lost item description");
        item.setLostLocation("Main Library");
        return item;
    }

    private FoundItem buildFound(String category, LocalDateTime dateFound) {
        FoundItem item = new FoundItem();
        item.setFoundItemId(UUID.randomUUID());
        item.setCategory(category);
        item.setDateFound(dateFound);
        item.setDescription("generic found item description");
        item.setFoundLocation("Main Library");
        return item;
    }
}
