package com.uom.lostfound.matching.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class LostItem {
    private UUID lostItemId;
    private String description;
    private String lostLocation;
    private String category;
    private LocalDateTime dateLost;
    private UUID reportedByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;
    private boolean isDeleted;

    public LostItem() {
    }

    public LostItem(UUID lostItemId, String description, String lostLocation, String category, LocalDateTime dateLost,
            UUID reportedByUserId, LocalDateTime createdAt, LocalDateTime updatedAt, String status, boolean isDeleted) {
        this.lostItemId = lostItemId;
        this.description = description;
        this.lostLocation = lostLocation;
        this.category = category;
        this.dateLost = dateLost;
        this.reportedByUserId = reportedByUserId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.status = status;
        this.isDeleted = isDeleted;
    }

    public UUID getLostItemId() {
        return lostItemId;
    }

    public void setLostItemId(UUID lostItemId) {
        this.lostItemId = lostItemId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLostLocation() {
        return lostLocation;
    }

    public void setLostLocation(String lostLocation) {
        this.lostLocation = lostLocation;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getDateLost() {
        return dateLost;
    }

    public void setDateLost(LocalDateTime dateLost) {
        this.dateLost = dateLost;
    }

    public UUID getReportedByUserId() {
        return reportedByUserId;
    }

    public void setReportedByUserId(UUID reportedByUserId) {
        this.reportedByUserId = reportedByUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public static LostItemBuilder builder() {
        return new LostItemBuilder();
    }

    public static class LostItemBuilder {
        private UUID lostItemId;
        private String description;
        private String lostLocation;
        private String category;
        private LocalDateTime dateLost;
        private UUID reportedByUserId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String status;
        private boolean isDeleted;

        public LostItemBuilder lostItemId(UUID lostItemId) {
            this.lostItemId = lostItemId;
            return this;
        }

        public LostItemBuilder description(String description) {
            this.description = description;
            return this;
        }

        public LostItemBuilder lostLocation(String lostLocation) {
            this.lostLocation = lostLocation;
            return this;
        }

        public LostItemBuilder category(String category) {
            this.category = category;
            return this;
        }

        public LostItemBuilder dateLost(LocalDateTime dateLost) {
            this.dateLost = dateLost;
            return this;
        }

        public LostItemBuilder reportedByUserId(UUID reportedByUserId) {
            this.reportedByUserId = reportedByUserId;
            return this;
        }

        public LostItemBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public LostItemBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public LostItemBuilder status(String status) {
            this.status = status;
            return this;
        }

        public LostItemBuilder isDeleted(boolean isDeleted) {
            this.isDeleted = isDeleted;
            return this;
        }

        public LostItem build() {
            return new LostItem(lostItemId, description, lostLocation, category, dateLost, reportedByUserId, createdAt,
                    updatedAt, status, isDeleted);
        }
    }
}
