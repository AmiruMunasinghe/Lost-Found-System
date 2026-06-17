package com.uom.lostfound.matching.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ConfirmMatchRequest {
    @NotNull
    private UUID confirmedByUserId;

    public ConfirmMatchRequest() {
    }

    public ConfirmMatchRequest(UUID confirmedByUserId) {
        this.confirmedByUserId = confirmedByUserId;
    }

    public UUID getConfirmedByUserId() {
        return confirmedByUserId;
    }

    public void setConfirmedByUserId(UUID confirmedByUserId) {
        this.confirmedByUserId = confirmedByUserId;
    }
}
