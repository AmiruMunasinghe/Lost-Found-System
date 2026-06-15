package uom.msd.lostfound.dto;

import uom.msd.lostfound.enums.RewardTransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RewardTransactionRequest {

    @NotNull
    private Long userId;

    @Min(1)
    private int points;

    @NotNull
    private RewardTransactionType transactionType;

    @NotBlank
    private String description;

    private Long referenceId;
}
