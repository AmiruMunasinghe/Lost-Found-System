package com.uom.lostfound.matching.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class ResolveReviewRequest {
    @NotNull
    private UUID adminId;

    @NotBlank
    private String resolution; // "APPROVED" or "REJECTED"

    private String note;

    public ResolveReviewRequest() {
    }

    public ResolveReviewRequest(UUID adminId, String resolution, String note) {
        this.adminId = adminId;
        this.resolution = resolution;
        this.note = note;
    }

    public UUID getAdminId() {
        return adminId;
    }

    public void setAdminId(UUID adminId) {
        this.adminId = adminId;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution == null ? null : resolution.trim();
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
