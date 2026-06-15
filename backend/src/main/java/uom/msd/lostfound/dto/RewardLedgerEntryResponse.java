package uom.msd.lostfound.dto;

import uom.msd.lostfound.enums.RewardTransactionType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class RewardLedgerEntryResponse {
    private Long id;
    private Long userId;
    private int points;
    private RewardTransactionType transactionType;
    private String description;
    private Long referenceId;
    private LocalDateTime createdAt;
}
