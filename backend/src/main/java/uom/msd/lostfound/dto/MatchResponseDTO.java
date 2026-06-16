package uom.msd.lostfound.dto;

import lombok.Builder;
import lombok.Data;
import uom.msd.lostfound.enums.MatchStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MatchResponseDTO {
    private Long id;
    private ItemResponseDTO lostItem;
    private ItemResponseDTO foundItem;
    private BigDecimal confidenceScore;
    private MatchStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
