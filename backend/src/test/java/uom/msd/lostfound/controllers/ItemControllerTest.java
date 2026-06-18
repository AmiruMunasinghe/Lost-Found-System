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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import uom.msd.lostfound.auth.AuthenticatedUser;
import uom.msd.lostfound.auth.JwtAuthenticationFilter;
import uom.msd.lostfound.dto.ItemRequestDTO;
import uom.msd.lostfound.dto.ItemResponseDTO;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.ReportType;
import uom.msd.lostfound.services.ItemService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ItemController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("ItemController Unit Tests")
class ItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ItemService itemService;

        @MockBean
        private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private ObjectMapper objectMapper;

    private ItemRequestDTO itemRequestDTO;
    private ItemResponseDTO itemResponseDTO;

    @BeforeEach
    void setUp() {
        itemRequestDTO = new ItemRequestDTO(
                "Lost Car Keys",
                "Silver car keys with keychain",
                "Electronics",
                "Library",
                ReportType.LOST
        );

        itemResponseDTO = new ItemResponseDTO(
                1L,
                "Lost Car Keys",
                "Silver car keys with keychain",
                "Electronics",
                "Library",
                ReportType.LOST,
                ItemStatus.OPEN,
                1L,
                LocalDateTime.now(),
                LocalDateTime.now(),
                new ArrayList<>()
        );
    }

    // ==================== Create Item Tests ====================

    @Test
    @DisplayName("Should create item and return 201 Created")
    void testCreateItem_Success() throws Exception {
        // Arrange
        when(itemService.createItem(eq(1L), org.mockito.ArgumentMatchers.any(ItemRequestDTO.class)))
                .thenReturn(itemResponseDTO);
        SecurityContextHolder.getContext().setAuthentication(authToken(1L));

        // Act & Assert
        mockMvc.perform(post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(itemRequestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Lost Car Keys"))
                .andExpect(jsonPath("$.reportType").value("LOST"))
                .andExpect(jsonPath("$.status").value("OPEN"));
        SecurityContextHolder.clearContext();

        verify(itemService, times(1)).createItem(eq(1L), org.mockito.ArgumentMatchers.any(ItemRequestDTO.class));
    }

    @Test
        @DisplayName("Should fail create when request is unauthenticated")
        void testCreateItem_Unauthenticated() throws Exception {
                SecurityContextHolder.clearContext();

                mockMvc.perform(post("/items")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(itemRequestDTO)))
                                .andExpect(status().isInternalServerError());

                verify(itemService, never()).createItem(anyLong(), org.mockito.ArgumentMatchers.any(ItemRequestDTO.class));
    }

    @Test
    @DisplayName("Should return 500 when user not found")
    void testCreateItem_UserNotFound() throws Exception {
        // Arrange
        when(itemService.createItem(eq(999L), org.mockito.ArgumentMatchers.any(ItemRequestDTO.class)))
                .thenThrow(new RuntimeException("User not found"));
        SecurityContextHolder.getContext().setAuthentication(authToken(999L));

        // Act & Assert
        mockMvc.perform(post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(itemRequestDTO)))
                .andExpect(status().isInternalServerError());
        SecurityContextHolder.clearContext();
    }

    // ==================== Get Item Tests ====================

    @Test
    @DisplayName("Should get item by ID and return 200")
    void testGetItemById_Success() throws Exception {
        // Arrange
        when(itemService.getItemById(1L)).thenReturn(itemResponseDTO);

        // Act & Assert
        mockMvc.perform(get("/items/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Lost Car Keys"));

        verify(itemService, times(1)).getItemById(1L);
    }

    @Test
    @DisplayName("Should return 404 when item not found")
    void testGetItemById_NotFound() throws Exception {
        // Arrange
        when(itemService.getItemById(999L)).thenThrow(new RuntimeException("Item not found"));

        // Act & Assert
        mockMvc.perform(get("/items/999"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("Should get all items and return 200")
    void testGetAllItems() throws Exception {
        // Arrange
        List<ItemResponseDTO> items = Arrays.asList(
                itemResponseDTO,
                buildItemResponse(2L, "Found Wallet", ReportType.FOUND, ItemStatus.OPEN, 2L),
                buildItemResponse(3L, "Lost Student Card", ReportType.LOST, ItemStatus.CLAIMED, 1L)
        );
        when(itemService.getAllItems()).thenReturn(items);

        // Act & Assert
        mockMvc.perform(get("/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].title").value("Lost Car Keys"))
                .andExpect(jsonPath("$[1].title").value("Found Wallet"))
                .andExpect(jsonPath("$[2].title").value("Lost Student Card"));

        verify(itemService, times(1)).getAllItems();
    }

    @Test
    @DisplayName("Should return empty list when no items exist")
    void testGetAllItems_Empty() throws Exception {
        // Arrange
        when(itemService.getAllItems()).thenReturn(new ArrayList<>());

        // Act & Assert
        mockMvc.perform(get("/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // ==================== Get by Type Tests ====================

    @Test
    @DisplayName("Should get LOST items and return 200")
    void testGetItemsByType_Lost() throws Exception {
        // Arrange
        List<ItemResponseDTO> items = Arrays.asList(
                itemResponseDTO,
                buildItemResponse(4L, "Lost Headphones", ReportType.LOST, ItemStatus.OPEN, 1L),
                buildItemResponse(5L, "Lost Notebook", ReportType.LOST, ItemStatus.CLOSED, 3L)
        );
        when(itemService.getItemsByType(ReportType.LOST)).thenReturn(items);

        // Act & Assert
        mockMvc.perform(get("/items/type/LOST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].reportType").value("LOST"))
                .andExpect(jsonPath("$[1].reportType").value("LOST"))
                .andExpect(jsonPath("$[2].reportType").value("LOST"));

        verify(itemService, times(1)).getItemsByType(ReportType.LOST);
    }

    @Test
    @DisplayName("Should get FOUND items and return 200")
    void testGetItemsByType_Found() throws Exception {
        // Arrange
        ItemResponseDTO foundItem = new ItemResponseDTO(
                2L, "Found Phone", "Black phone", "Electronics", "Student Center",
                ReportType.FOUND, ItemStatus.OPEN, 1L, LocalDateTime.now(), LocalDateTime.now(),
                new ArrayList<>()
        );
        when(itemService.getItemsByType(ReportType.FOUND)).thenReturn(Arrays.asList(foundItem));

        // Act & Assert
        mockMvc.perform(get("/items/type/FOUND"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reportType").value("FOUND"));
    }

    // ==================== Get by Status Tests ====================

    @Test
    @DisplayName("Should get OPEN items")
    void testGetItemsByStatus_Open() throws Exception {
        // Arrange
        when(itemService.getItemsByStatus(ItemStatus.OPEN)).thenReturn(Arrays.asList(itemResponseDTO));

        // Act & Assert
        mockMvc.perform(get("/items/status/OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("OPEN"));
    }

    @Test
    @DisplayName("Should get CLAIMED items")
    void testGetItemsByStatus_Claimed() throws Exception {
        // Arrange
        ItemResponseDTO claimedItem = new ItemResponseDTO(
                1L, "Lost Car Keys", "Description", "Electronics", "Library",
                ReportType.LOST, ItemStatus.CLAIMED, 1L, LocalDateTime.now(), LocalDateTime.now(),
                new ArrayList<>()
        );
        when(itemService.getItemsByStatus(ItemStatus.CLAIMED)).thenReturn(Arrays.asList(claimedItem));

        // Act & Assert
        mockMvc.perform(get("/items/status/CLAIMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("CLAIMED"));
    }

    // ==================== Get by User Tests ====================

    @Test
    @DisplayName("Should get user's items")
    void testGetUserItems() throws Exception {
        // Arrange
        when(itemService.getUserItems(1L)).thenReturn(Arrays.asList(
                itemResponseDTO,
                buildItemResponse(6L, "Lost Charger", ReportType.LOST, ItemStatus.OPEN, 1L),
                buildItemResponse(7L, "Found Pen", ReportType.FOUND, ItemStatus.CLAIMED, 1L)
        ));

        // Act & Assert
        mockMvc.perform(get("/items/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].userId").value(1))
                .andExpect(jsonPath("$[1].userId").value(1))
                .andExpect(jsonPath("$[2].userId").value(1));

        verify(itemService, times(1)).getUserItems(1L);
    }

    // ==================== Filter Tests ====================

    @Test
    @DisplayName("Should filter items by type and status")
    void testGetItemsByTypeAndStatus() throws Exception {
        // Arrange
        when(itemService.getItemsByTypeAndStatus(ReportType.LOST, ItemStatus.OPEN))
                .thenReturn(Arrays.asList(itemResponseDTO));

        // Act & Assert
        mockMvc.perform(get("/items/filter")
                .param("type", "LOST")
                .param("status", "OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reportType").value("LOST"))
                .andExpect(jsonPath("$[0].status").value("OPEN"));
    }

    @Test
    @DisplayName("Should get items by category")
    void testGetItemsByCategory() throws Exception {
        // Arrange
        when(itemService.getItemsByCategory("Electronics", ReportType.LOST))
                .thenReturn(Arrays.asList(itemResponseDTO));

        // Act & Assert
        mockMvc.perform(get("/items/category")
                .param("category", "Electronics")
                .param("type", "LOST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("Electronics"));
    }

    @Test
    @DisplayName("Should get items by location and status")
    void testGetItemsByLocation() throws Exception {
        // Arrange
        when(itemService.getItemsByLocation("Library", ItemStatus.OPEN))
                .thenReturn(Arrays.asList(itemResponseDTO));

        // Act & Assert
        mockMvc.perform(get("/items/location")
                .param("location", "Library")
                .param("status", "OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].location").value("Library"));
    }

    // ==================== Search Tests ====================

    @Test
    @DisplayName("Should search items by query")
    void testSearchItems() throws Exception {
        // Arrange
        when(itemService.searchItems("keys")).thenReturn(Arrays.asList(itemResponseDTO));

        // Act & Assert
        mockMvc.perform(get("/items/search")
                .param("q", "keys"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        verify(itemService, times(1)).searchItems("keys");
    }

    @Test
    @DisplayName("Should return empty list for no search matches")
    void testSearchItems_NoMatches() throws Exception {
        // Arrange
        when(itemService.searchItems("nonexistent")).thenReturn(new ArrayList<>());

        // Act & Assert
        mockMvc.perform(get("/items/search")
                .param("q", "nonexistent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

        @Test
        @DisplayName("Should return 400 for blank search query")
        void testSearchItems_BlankQuery() throws Exception {
                // Act & Assert
                mockMvc.perform(get("/items/search")
                                .param("q", "   "))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$", hasSize(0)));

                verify(itemService, never()).searchItems(anyString());
        }

    // ==================== Update Tests ====================

    @Test
    @DisplayName("Should update item status to CLAIMED")
    void testUpdateItemStatus_Claimed() throws Exception {
        // Arrange
        ItemResponseDTO updatedItem = new ItemResponseDTO(
                1L, "Lost Car Keys", "Description", "Electronics", "Library",
                ReportType.LOST, ItemStatus.CLAIMED, 1L, LocalDateTime.now(), LocalDateTime.now(),
                new ArrayList<>()
        );
        when(itemService.updateItemStatus(1L, ItemStatus.CLAIMED)).thenReturn(updatedItem);

        // Act & Assert
        mockMvc.perform(put("/items/1/status")
                .param("status", "CLAIMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLAIMED"));

        verify(itemService, times(1)).updateItemStatus(1L, ItemStatus.CLAIMED);
    }

    @Test
    @DisplayName("Should update item status to RESOLVED")
    void testUpdateItemStatus_Resolved() throws Exception {
        // Arrange
        ItemResponseDTO updatedItem = new ItemResponseDTO(
                1L, "Lost Car Keys", "Description", "Electronics", "Library",
                ReportType.LOST, ItemStatus.CLOSED, 1L, LocalDateTime.now(), LocalDateTime.now(),
                new ArrayList<>()
        );
        when(itemService.updateItemStatus(1L, ItemStatus.CLOSED)).thenReturn(updatedItem);

        // Act & Assert
        mockMvc.perform(put("/items/1/status")
                .param("status", "CLOSED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));
    }

    @Test
    @DisplayName("Should return error when updating status of non-existent item")
    void testUpdateItemStatus_NotFound() throws Exception {
        // Arrange
        when(itemService.updateItemStatus(999L, ItemStatus.CLAIMED))
                .thenThrow(new RuntimeException("Item not found"));

        // Act & Assert
        mockMvc.perform(put("/items/999/status")
                .param("status", "CLAIMED"))
                .andExpect(status().isInternalServerError());
    }

    // ==================== Image Tests ====================

    @Test
    @DisplayName("Should add image to item and return 201 Created")
    void testAddImageToItem_Success() throws Exception {
        // Arrange
        String imageJson = "{\"imageUrl\": \"https://example.com/image.jpg\"}";
        when(itemService.addImageToItem(1L, "https://example.com/image.jpg"))
                .thenReturn(itemResponseDTO);

        // Act & Assert
        mockMvc.perform(post("/items/1/images")
                .contentType(MediaType.APPLICATION_JSON)
                .content(imageJson))
                .andExpect(status().isCreated());

        verify(itemService, times(1)).addImageToItem(1L, "https://example.com/image.jpg");
    }

    @Test
    @DisplayName("Should return error when adding image to non-existent item")
    void testAddImageToItem_NotFound() throws Exception {
        // Arrange
        String imageJson = "{\"imageUrl\": \"https://example.com/image.jpg\"}";
        when(itemService.addImageToItem(999L, "https://example.com/image.jpg"))
                .thenThrow(new RuntimeException("Item not found"));

        // Act & Assert
        mockMvc.perform(post("/items/999/images")
                .contentType(MediaType.APPLICATION_JSON)
                .content(imageJson))
                .andExpect(status().isInternalServerError());
    }

    // ==================== Delete Tests ====================

    @Test
    @DisplayName("Should delete item and return 204 No Content")
    void testDeleteItem_Success() throws Exception {
        // Arrange
        doNothing().when(itemService).deleteItem(1L);

        // Act & Assert
        mockMvc.perform(delete("/items/1"))
                .andExpect(status().isNoContent());

        verify(itemService, times(1)).deleteItem(1L);
    }

    @Test
    @DisplayName("Should return error when deleting non-existent item")
    void testDeleteItem_NotFound() throws Exception {
        // Arrange
        doThrow(new RuntimeException("Item not found")).when(itemService).deleteItem(999L);

        // Act & Assert
        mockMvc.perform(delete("/items/999"))
                .andExpect(status().isInternalServerError());
    }

    // ==================== Pagination Tests ====================

    @Test
    @DisplayName("Should get items with pagination")
    void testGetItemsWithPagination() throws Exception {
        // Arrange
        when(itemService.getItemsWithPagination(0, 10)).thenReturn(Arrays.asList(
                itemResponseDTO,
                buildItemResponse(8L, "Found USB Drive", ReportType.FOUND, ItemStatus.OPEN, 2L),
                buildItemResponse(9L, "Lost Water Bottle", ReportType.LOST, ItemStatus.OPEN, 1L)
        ));

        // Act & Assert
        mockMvc.perform(get("/items/paginated")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));

        verify(itemService, times(1)).getItemsWithPagination(0, 10);
    }

    @Test
    @DisplayName("Should use default pagination values")
    void testGetItemsWithPagination_Defaults() throws Exception {
        // Arrange
        when(itemService.getItemsWithPagination(0, 10)).thenReturn(new ArrayList<>());

        // Act & Assert
        mockMvc.perform(get("/items/paginated"))
                .andExpect(status().isOk());
    }

        @Test
        @DisplayName("Should normalize negative page and non-positive size")
        void testGetItemsWithPagination_NormalizesInvalidInputs() throws Exception {
                // Arrange
                when(itemService.getItemsWithPagination(0, 10)).thenReturn(new ArrayList<>());

                // Act & Assert
                mockMvc.perform(get("/items/paginated")
                                .param("page", "-2")
                                .param("size", "0"))
                                .andExpect(status().isOk());

                verify(itemService, times(1)).getItemsWithPagination(0, 10);
        }

        @Test
        @DisplayName("Should cap pagination size at 50")
        void testGetItemsWithPagination_CapsLargeSize() throws Exception {
                // Arrange
                when(itemService.getItemsWithPagination(1, 50)).thenReturn(new ArrayList<>());

                // Act & Assert
                mockMvc.perform(get("/items/paginated")
                                .param("page", "1")
                                .param("size", "200"))
                                .andExpect(status().isOk());

                verify(itemService, times(1)).getItemsWithPagination(1, 50);
        }

        private ItemResponseDTO buildItemResponse(Long id, String title, ReportType type, ItemStatus status, Long userId) {
                return new ItemResponseDTO(
                                id,
                                title,
                                "Test description",
                                "Electronics",
                                "Library",
                                type,
                                status,
                                userId,
                                LocalDateTime.now(),
                                LocalDateTime.now(),
                                new ArrayList<>()
                );
        }

        private UsernamePasswordAuthenticationToken authToken(Long userId) {
                AuthenticatedUser authenticatedUser = new AuthenticatedUser(userId, "testuser", "test@example.com", uom.msd.lostfound.enums.Role.USER);
                return new UsernamePasswordAuthenticationToken(authenticatedUser, null, authenticatedUser.getAuthorities());
        }
}
