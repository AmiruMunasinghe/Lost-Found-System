package uom.msd.lostfound.matching;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.MatchStatus;
import uom.msd.lostfound.enums.ReportType;
import uom.msd.lostfound.events.ItemCreatedEvent;
import uom.msd.lostfound.events.ItemMatchedEvent;
import uom.msd.lostfound.models.Item;
import uom.msd.lostfound.models.ItemMatch;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.ItemMatchRepository;
import uom.msd.lostfound.repositories.ItemRepository;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MatchingEngine Unit Tests")
class MatchingEngineTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private ItemMatchRepository itemMatchRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private MatchingEngine matchingEngine;

    private User testUser1;
    private User testUser2;
    private Item lostItem;
    private Item foundItem;

    @BeforeEach
    void setUp() {
        // Set weights & thresholds in MatchingEngine via reflection to simulate application.properties configuration
        ReflectionTestUtils.setField(matchingEngine, "autoAcceptThreshold", 0.70);
        ReflectionTestUtils.setField(matchingEngine, "manualReviewThreshold", 0.45);
        ReflectionTestUtils.setField(matchingEngine, "weightText", 0.50);
        ReflectionTestUtils.setField(matchingEngine, "weightCategory", 0.30);
        ReflectionTestUtils.setField(matchingEngine, "weightLocation", 0.20);

        testUser1 = mock(User.class);
        lenient().when(testUser1.getId()).thenReturn(101L);
        lenient().when(testUser1.getEmail()).thenReturn("lost@user.com");

        testUser2 = mock(User.class);
        lenient().when(testUser2.getId()).thenReturn(102L);
        lenient().when(testUser2.getEmail()).thenReturn("found@user.com");

        lostItem = new Item();
        lostItem.setId(1L);
        lostItem.setTitle("Black Leather Wallet");
        lostItem.setDescription("A black leather Tommy Hilfiger wallet with student ID cards");
        lostItem.setCategory("Personal Belongings");
        lostItem.setLocation("Main Library 2nd floor");
        lostItem.setReportType(ReportType.LOST);
        lostItem.setStatus(ItemStatus.OPEN);
        lostItem.setUser(testUser1);

        foundItem = new Item();
        foundItem.setId(2L);
        foundItem.setTitle("Leather Wallet Black");
        foundItem.setDescription("Found a black wallet with some bank cards, brand Tommy Hilfiger");
        foundItem.setCategory("Personal Belongings");
        foundItem.setLocation("Library reading room");
        foundItem.setReportType(ReportType.FOUND);
        foundItem.setStatus(ItemStatus.OPEN);
        foundItem.setUser(testUser2);
    }

    @Test
    @DisplayName("Should compute similarity score correctly")
    void testCalculateSimilarity() {
        BigDecimal score = matchingEngine.calculateSimilarity(lostItem, foundItem);
        assertNotNull(score);
        assertTrue(score.doubleValue() > 0.0);
        // Expect a high score because category matches exactly, and title/location have overlap
        assertTrue(score.doubleValue() >= 0.58, "Expected high score, got: " + score);
    }

    @Test
    @DisplayName("Should suggest a match automatically when score exceeds autoAcceptThreshold")
    void testTriggerMatching_AutoAccept() {
        // Arrange
        when(itemRepository.findById(1L)).thenReturn(Optional.of(lostItem));
        when(itemRepository.findByReportTypeAndStatus(ReportType.FOUND, ItemStatus.OPEN))
                .thenReturn(List.of(foundItem));
        when(itemMatchRepository.findByLostItemIdAndFoundItemId(1L, 2L))
                .thenReturn(Optional.empty());

        // Force a high similarity score by editing test items to be identical
        lostItem.setTitle("Black Wallet");
        lostItem.setDescription("Found wallet");
        lostItem.setLocation("Library");
        
        foundItem.setTitle("Black Wallet");
        foundItem.setDescription("Found wallet");
        foundItem.setLocation("Library");

        // Act
        matchingEngine.triggerMatching(1L);

        // Assert
        ArgumentCaptor<ItemMatch> matchCaptor = ArgumentCaptor.forClass(ItemMatch.class);
        verify(itemMatchRepository, times(1)).save(matchCaptor.capture());
        
        ItemMatch savedMatch = matchCaptor.getValue();
        assertEquals(MatchStatus.SUGGESTED, savedMatch.getStatus());
        assertTrue(savedMatch.getConfidenceScore().doubleValue() >= 0.70);
        
        // Should trigger notification
        verify(eventPublisher, times(1)).publishEvent(any(ItemMatchedEvent.class));
    }

    @Test
    @DisplayName("Should put match in PENDING_REVIEW when score is between manualReviewThreshold and autoAcceptThreshold")
    void testTriggerMatching_PendingReview() {
        // Arrange
        when(itemRepository.findById(1L)).thenReturn(Optional.of(lostItem));
        when(itemRepository.findByReportTypeAndStatus(ReportType.FOUND, ItemStatus.OPEN))
                .thenReturn(List.of(foundItem));
        when(itemMatchRepository.findByLostItemIdAndFoundItemId(1L, 2L))
                .thenReturn(Optional.empty());

        // Set properties to yield a moderate score (e.g., matching category but low description overlap)
        lostItem.setTitle("Black Tommy Hilfiger Wallet");
        lostItem.setDescription("Lost yesterday");
        lostItem.setLocation("Gym");
        
        foundItem.setTitle("Blue Umbrella");
        foundItem.setDescription("Found a gym bag with keys and cards inside");
        foundItem.setLocation("Gym");
        // Category matches, location matches, text doesn't overlap -> score is 0.50
        lostItem.setCategory("Personal Belongings");
        foundItem.setCategory("Personal Belongings");

        // Act
        matchingEngine.triggerMatching(1L);

        // Assert
        ArgumentCaptor<ItemMatch> matchCaptor = ArgumentCaptor.forClass(ItemMatch.class);
        verify(itemMatchRepository, times(1)).save(matchCaptor.capture());
        
        ItemMatch savedMatch = matchCaptor.getValue();
        assertEquals(MatchStatus.PENDING_REVIEW, savedMatch.getStatus());
        
        // Should NOT trigger notification to users
        verify(eventPublisher, never()).publishEvent(any(ItemMatchedEvent.class));
    }

    @Test
    @DisplayName("Should listen to ItemCreatedEvent and trigger matching")
    void testHandleItemCreatedEvent() {
        // Arrange
        ItemCreatedEvent event = new ItemCreatedEvent(this, lostItem);
        when(itemRepository.findById(1L)).thenReturn(Optional.of(lostItem));

        // Act
        matchingEngine.handleItemCreated(event);

        // Assert
        verify(itemRepository, times(1)).findById(1L);
    }
}
