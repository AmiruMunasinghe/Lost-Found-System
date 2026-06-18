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
import uom.msd.lostfound.events.ItemMatchedEvent;
import uom.msd.lostfound.models.Item;
import uom.msd.lostfound.models.ItemMatch;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.ItemMatchRepository;
import uom.msd.lostfound.repositories.ItemRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

    private Item lostItem;
    private Item foundItem;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(matchingEngine, "suggestedThreshold", 0.70);
        ReflectionTestUtils.setField(matchingEngine, "manualReviewThreshold", 0.45);
        ReflectionTestUtils.setField(matchingEngine, "weightText", 0.50);
        ReflectionTestUtils.setField(matchingEngine, "weightCategory", 0.30);
        ReflectionTestUtils.setField(matchingEngine, "weightLocation", 0.20);

        User lostOwner = new User();
        lostOwner.setId(101L);
        lostOwner.setEmail("lost@example.com");

        User foundOwner = new User();
        foundOwner.setId(202L);
        foundOwner.setEmail("found@example.com");

        lostItem = new Item();
        lostItem.setId(1L);
        lostItem.setTitle("Black Wallet");
        lostItem.setDescription("Black leather wallet with student ID");
        lostItem.setCategory("Personal Belongings");
        lostItem.setLocation("Library");
        lostItem.setReportType(ReportType.LOST);
        lostItem.setStatus(ItemStatus.OPEN);
        lostItem.setUser(lostOwner);

        foundItem = new Item();
        foundItem.setId(2L);
        foundItem.setTitle("Black Wallet");
        foundItem.setDescription("Found black leather wallet with ID cards");
        foundItem.setCategory("Personal Belongings");
        foundItem.setLocation("Library");
        foundItem.setReportType(ReportType.FOUND);
        foundItem.setStatus(ItemStatus.OPEN);
        foundItem.setUser(foundOwner);
    }

    @Test
    @DisplayName("Should create suggested match after admin-filtered lost item is matched")
    void shouldCreateSuggestedMatchAfterFiltering() {
        when(itemRepository.findById(1L)).thenReturn(Optional.of(lostItem));
        when(itemRepository.findByReportTypeAndStatus(ReportType.FOUND, ItemStatus.OPEN)).thenReturn(List.of(foundItem));
        when(itemMatchRepository.findByLostItemIdAndFoundItemId(1L, 2L)).thenReturn(Optional.empty());
        when(itemMatchRepository.save(any(ItemMatch.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<ItemMatch> matches = matchingEngine.runForFilteredLostItem(1L);

        assertEquals(1, matches.size());
        assertEquals(MatchStatus.SUGGESTED, matches.get(0).getStatus());
        assertTrue(matches.get(0).getConfidenceScore().doubleValue() >= 0.70);
        verify(eventPublisher, times(1)).publishEvent(any(ItemMatchedEvent.class));
    }

    @Test
    @DisplayName("Should update existing suggested match instead of creating duplicate")
    void shouldUpdateExistingMatch() {
        ItemMatch existing = new ItemMatch(lostItem, foundItem, java.math.BigDecimal.valueOf(0.50));
        existing.setId(10L);
        existing.setStatus(MatchStatus.PENDING_REVIEW);

        when(itemRepository.findById(1L)).thenReturn(Optional.of(lostItem));
        when(itemRepository.findByReportTypeAndStatus(ReportType.FOUND, ItemStatus.OPEN)).thenReturn(List.of(foundItem));
        when(itemMatchRepository.findByLostItemIdAndFoundItemId(1L, 2L)).thenReturn(Optional.of(existing));
        when(itemMatchRepository.save(any(ItemMatch.class))).thenAnswer(invocation -> invocation.getArgument(0));

        matchingEngine.runForFilteredLostItem(1L);

        ArgumentCaptor<ItemMatch> captor = ArgumentCaptor.forClass(ItemMatch.class);
        verify(itemMatchRepository).save(captor.capture());
        assertEquals(10L, captor.getValue().getId());
        assertEquals(MatchStatus.SUGGESTED, captor.getValue().getStatus());
    }

    @Test
    @DisplayName("Should ignore low-score candidates")
    void shouldIgnoreLowScoreCandidate() {
        foundItem.setTitle("Blue Umbrella");
        foundItem.setDescription("Small umbrella found near sports complex");
        foundItem.setCategory("Accessories");
        foundItem.setLocation("Gym");

        when(itemRepository.findById(1L)).thenReturn(Optional.of(lostItem));
        when(itemRepository.findByReportTypeAndStatus(ReportType.FOUND, ItemStatus.OPEN)).thenReturn(List.of(foundItem));

        List<ItemMatch> matches = matchingEngine.runForFilteredLostItem(1L);

        assertTrue(matches.isEmpty());
        verify(itemMatchRepository, never()).save(any(ItemMatch.class));
        verify(eventPublisher, never()).publishEvent(any(ItemMatchedEvent.class));
    }
}
