package com.uom.lostfound.matching.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class RecalculateRequest {
    @NotNull
    private UUID lostItemId;

    @NotNull
    private UUID foundItemId;

    public RecalculateRequest() {
    }

    public RecalculateRequest(UUID lostItemId, UUID foundItemId) {
        this.lostItemId = lostItemId;
        this.foundItemId = foundItemId;
    }

    public UUID getLostItemId() {
        return lostItemId;
    }

    public void setLostItemId(UUID lostItemId) {
        this.lostItemId = lostItemId;
    }

    public UUID getFoundItemId() {
        return foundItemId;
    }

    public void setFoundItemId(UUID foundItemId) {
        this.foundItemId = foundItemId;
    }
}
