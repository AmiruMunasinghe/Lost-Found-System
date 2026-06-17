package uom.msd.lostfound.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RewardBalanceResponse {
    private Long userId;
    private int balance;
    private List<RewardLedgerEntryResponse> history;
}
