package uom.msd.lostfound.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import uom.msd.lostfound.auth.JwtAuthenticationFilter;
import uom.msd.lostfound.auth.RestAuthenticationEntryPoint;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.MatchStatus;
import uom.msd.lostfound.enums.ReportType;
import uom.msd.lostfound.matching.MatchingEngine;
import uom.msd.lostfound.models.Item;
import uom.msd.lostfound.models.ItemMatch;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.ItemMatchRepository;
import uom.msd.lostfound.repositories.ItemRepository;
import uom.msd.lostfound.services.AuthService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

    private ItemMatch testMatch;

    @BeforeEach
    void setUp() {
        User lostOwner = new User();
        lostOwner.setId(101L);

        User foundOwner = new User();
        foundOwner.setId(202L);

        Item lostItem = new Item();
        lostItem.setId(1L);
        lostItem.setTitle("Lost Keys");
        lostItem.setDescription("Keychain");
        lostItem.setCategory("Keys");
        lostItem.setLocation("Hall");
        lostItem.setReportType(ReportType.LOST);
        lostItem.setStatus(ItemStatus.OPEN);
        lostItem.setUser(lostOwner);
        lostItem.setImages(new ArrayList<>());
        lostItem.setCreatedAt(LocalDateTime.now());
        lostItem.setUpdatedAt(LocalDateTime.now());

        Item foundItem = new Item();
        foundItem.setId(2L);
        foundItem.setTitle("Found Keys");
        foundItem.setDescription("Keychain with key ring");
        foundItem.setCategory("Keys");
        foundItem.setLocation("Hall");
        foundItem.setReportType(ReportType.FOUND);
        foundItem.setStatus(ItemStatus.OPEN);
        foundItem.setUser(foundOwner);
        foundItem.setImages(new ArrayList<>());
        foundItem.setCreatedAt(LocalDateTime.now());
        foundItem.setUpdatedAt(LocalDateTime.now());

        testMatch = new ItemMatch(lostItem, foundItem, BigDecimal.valueOf(0.85));
        testMatch.setId(5L);
        testMatch.setStatus(MatchStatus.SUGGESTED);
        testMatch.setCreatedAt(LocalDateTime.now());
        testMatch.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should retrieve only matches visible to authenticated user")
    void shouldGetMyMatches() throws Exception {
        when(itemMatchRepository.findMatchesVisibleToUser(101L)).thenReturn(List.of(testMatch));

        mockMvc.perform(get("/matches/my").with(authenticatedUser(101L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(5))
                .andExpect(jsonPath("$[0].lostItem.id").value(1))
                .andExpect(jsonPath("$[0].foundItem.id").value(2));

        verify(itemMatchRepository, times(1)).findMatchesVisibleToUser(101L);
    }

    private RequestPostProcessor authenticatedUser(Long userId) {
        return request -> {
            uom.msd.lostfound.auth.AuthenticatedUser principal =
                    new uom.msd.lostfound.auth.AuthenticatedUser(userId, "student", "student@example.com", uom.msd.lostfound.enums.Role.USER);
            SecurityContextHolder.setContext(new SecurityContextImpl(
                    new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())));
            return request;
        };
    }
}
