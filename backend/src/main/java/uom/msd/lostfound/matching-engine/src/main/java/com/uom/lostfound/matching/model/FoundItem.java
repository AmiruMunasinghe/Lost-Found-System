package com.uom.lostfound.matching.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class FoundItem {
    private UUID foundItemId;
    private String description;
    private String foundLocation;
    private String category;
    private LocalDateTime dateFound;
    private UUID reportedByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;
    private boolean isDeleted;

    public FoundItem() {
    }

    public FoundItem(UUID foundItemId, String description, String foundLocation, String category,
            LocalDateTime dateFound, UUID reportedByUserId, LocalDateTime createdAt, LocalDateTime updatedAt,
            String status, boolean isDeleted) {
        this.foundItemId = foundItemId;
        this.description = description;
        this.foundLocation = foundLocation;
        this.category = category;
        this.dateFound = dateFound;
        this.reportedByUserId = reportedByUserId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.status = status;
        this.isDeleted = isDeleted;
    }

    public UUID getFoundItemId() {
        return foundItemId;
    }

    public void setFoundItemId(UUID foundItemId) {
        this.foundItemId = foundItemId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFoundLocation() {
        return foundLocation;
    }

    public void setFoundLocation(String foundLocation) {
        this.foundLocation = foundLocation;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getDateFound() {
        return dateFound;
    }

    public void setDateFound(LocalDateTime dateFound) {
        this.dateFound = dateFound;
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

    public static FoundItemBuilder builder() {
        return new FoundItemBuilder();
    }

    public static class FoundItemBuilder {
        private UUID foundItemId;
        private String description;
        private String foundLocation;
        private String category;
        private LocalDateTime dateFound;
        private UUID reportedByUserId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String status;
        private boolean isDeleted;

        public FoundItemBuilder foundItemId(UUID foundItemId) {
            this.foundItemId = foundItemId;
            return this;
        }

        public FoundItemBuilder description(String description) {
            this.description = description;
            return this;
        }

        public FoundItemBuilder foundLocation(String foundLocation) {
            this.foundLocation = foundLocation;
            return this;
        }

        public FoundItemBuilder category(String category) {
            this.category = category;
            return this;
        }

        public FoundItemBuilder dateFound(LocalDateTime dateFound) {
            this.dateFound = dateFound;
            return this;
        }

        public FoundItemBuilder reportedByUserId(UUID reportedByUserId) {
            this.reportedByUserId = reportedByUserId;
            return this;
        }

        public FoundItemBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public FoundItemBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public FoundItemBuilder status(String status) {
            this.status = status;
            return this;
        }

        public FoundItemBuilder isDeleted(boolean isDeleted) {
            this.isDeleted = isDeleted;
            return this;
        }

        public FoundItem build() {
            return new FoundItem(foundItemId, description, foundLocation, category, dateFound, reportedByUserId,
                    createdAt, updatedAt, status, isDeleted);
        }
    }
}
