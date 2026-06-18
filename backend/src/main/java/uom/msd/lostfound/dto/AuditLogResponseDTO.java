package uom.msd.lostfound.dto;

import java.time.LocalDateTime;

import uom.msd.lostfound.enums.AuditAction;

/**
 * DTO for audit log entries
 */
public class AuditLogResponseDTO {
    private Long id;
    private String adminUsername;
    private Long adminId;
    private AuditAction action;
    private String entityType;
    private Long entityId;
    private String outcome;
    private String notes;
    private LocalDateTime timestamp;

    public AuditLogResponseDTO() {
    }

    public AuditLogResponseDTO(Long id, String adminUsername, Long adminId, AuditAction action,
                              String entityType, Long entityId, String outcome, String notes,
                              LocalDateTime timestamp) {
        this.id = id;
        this.adminUsername = adminUsername;
        this.adminId = adminId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.outcome = outcome;
        this.notes = notes;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAdminUsername() {
        return adminUsername;
    }

    public void setAdminUsername(String adminUsername) {
        this.adminUsername = adminUsername;
    }

    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

    public AuditAction getAction() {
        return action;
    }

    public void setAction(AuditAction action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
