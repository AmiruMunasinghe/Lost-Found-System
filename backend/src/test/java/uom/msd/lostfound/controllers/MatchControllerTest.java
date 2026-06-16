package uom.msd.lostfound.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.MatchStatus;
import uom.msd.lostfound.enums.ReportType;
import uom.msd.lostfound.matching.MatchingEngine;
import uom.msd.lostfound.models.Item;
import uom.msd.lostfound.models.ItemMatch;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.ItemMatchRepository;
import uom.msd.lostfound.repositories.ItemRepository;
import uom.msd.lostfound.auth.JwtAuthenticationFilter;
import uom.msd.lostfound.auth.RestAuthenticationEntryPoint;
import uom.msd.lostfound.services.AuthService;
import uom.msd.lostfound.services.ItemService;
import uom.msd.lostfound.services.NotificationService;
import uom.msd.lostfound.services.RewardService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MatchController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("MatchController Unit Tests")
class MatchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ItemMatchRepository itemMatchRepository;

    @MockBean
    private ItemRepository itemRepository;

    @MockBean
    private MatchingEngine matchingEngine;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RestAuthenticationEntryPoint restAuthenticationEntryPoint;

    @MockBean
    private AuthService authService;

    @MockBean
    private ItemService itemService;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private RewardService rewardService;



    private User testUser1;
    private User testUser2;
    private Item lostItem;
    private Item foundItem;
    private ItemMatch testMatch;

    @BeforeEach
    void setUp() {
        testUser1 = mock(User.class);
        lenient().when(testUser1.getId()).thenReturn(101L);

        testUser2 = mock(User.class);
        lenient().when(testUser2.getId()).thenReturn(102L);

        lostItem = new Item();
        lostItem.setId(1L);
        lostItem.setTitle("Lost Keys");
        lostItem.setDescription("Keychain");
        lostItem.setCategory("Keys");
        lostItem.setLocation("Hall");
        lostItem.setReportType(ReportType.LOST);
        lostItem.setStatus(ItemStatus.OPEN);
        lostItem.setUser(testUser1);
        lostItem.setImages(new ArrayList<>());
        lostItem.setCreatedAt(LocalDateTime.now());
        lostItem.setUpdatedAt(LocalDateTime.now());

        foundItem = new Item();
        foundItem.setId(2L);
        foundItem.setTitle("Found Keys");
        foundItem.setDescription("Keychain with key ring");
        foundItem.setCategory("Keys");
        foundItem.setLocation("Hall");
        foundItem.setReportType(ReportType.FOUND);
        foundItem.setStatus(ItemStatus.OPEN);
        foundItem.setUser(testUser2);
        foundItem.setImages(new ArrayList<>());
        foundItem.setCreatedAt(LocalDateTime.now());
        foundItem.setUpdatedAt(LocalDateTime.now());

        testMatch = new ItemMatch();
        testMatch.setId(5L);
        testMatch.setLostItem(lostItem);
        testMatch.setFoundItem(foundItem);
        testMatch.setConfidenceScore(BigDecimal.valueOf(0.85));
        testMatch.setStatus(MatchStatus.SUGGESTED);
        testMatch.setCreatedAt(LocalDateTime.now());
        testMatch.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should retrieve matches filtered by status")
    void testGetMatchesByStatus() throws Exception {
        when(itemMatchRepository.findByStatus(MatchStatus.SUGGESTED)).thenReturn(List.of(testMatch));

        mockMvc.perform(get("/matches").param("status", "SUGGESTED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(5))
                .andExpect(jsonPath("$[0].status").value("SUGGESTED"))
                .andExpect(jsonPath("$[0].confidenceScore").value(0.85));

        verify(itemMatchRepository, times(1)).findByStatus(MatchStatus.SUGGESTED);
    }

    @Test
    @DisplayName("Should retrieve specific match by ID")
    void testGetMatchById() throws Exception {
        when(itemMatchRepository.findById(5L)).thenReturn(Optional.of(testMatch));

        mockMvc.perform(get("/matches/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.lostItem.id").value(1))
                .andExpect(jsonPath("$.foundItem.id").value(2));

        verify(itemMatchRepository, times(1)).findById(5L);
    }

    @Test
    @DisplayName("Should confirm suggested match and update status to ACCEPTED")
    void testConfirmMatch() throws Exception {
        when(itemMatchRepository.findById(5L)).thenReturn(Optional.of(testMatch));
        when(itemMatchRepository.save(any(ItemMatch.class))).thenReturn(testMatch);

        mockMvc.perform(post("/matches/5/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        verify(itemMatchRepository, times(1)).findById(5L);
        verify(itemRepository, times(1)).save(lostItem);
        verify(itemRepository, times(1)).save(foundItem);
        verify(itemMatchRepository, times(1)).save(any(ItemMatch.class));
    }

    @Test
    @DisplayName("Should retrieve manual review queue")
    void testGetReviewQueue() throws Exception {
        testMatch.setStatus(MatchStatus.PENDING_REVIEW);
        when(itemMatchRepository.findByStatus(MatchStatus.PENDING_REVIEW)).thenReturn(List.of(testMatch));

        mockMvc.perform(get("/matches/review-queue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(5))
                .andExpect(jsonPath("$[0].status").value("PENDING_REVIEW"));

        verify(itemMatchRepository, times(1)).findByStatus(MatchStatus.PENDING_REVIEW);
    }

    @Test
    @DisplayName("Should approve match from manual review queue and notify users")
    void testApprovePendingMatch() throws Exception {
        testMatch.setStatus(MatchStatus.PENDING_REVIEW);
        when(itemMatchRepository.findById(5L)).thenReturn(Optional.of(testMatch));
        when(itemMatchRepository.save(any(ItemMatch.class))).thenReturn(testMatch);

        mockMvc.perform(post("/matches/review-queue/5/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUGGESTED"));

        verify(itemMatchRepository, times(1)).findById(5L);
        verify(itemMatchRepository, times(1)).save(any(ItemMatch.class));
        verify(matchingEngine, times(1)).notifyOnHighMatch(any(ItemMatch.class));
    }
}
