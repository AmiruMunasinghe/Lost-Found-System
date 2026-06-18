package uom.msd.lostfound.services;

import uom.msd.lostfound.enums.AuditAction;
import uom.msd.lostfound.models.AuditLog;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service interface for audit logging
 */
public interface AuditLogService {
    /**
     * Log an admin action
     */
    AuditLog logAction(Long adminId, AuditAction action, String entityType, Long entityId, String outcome, String notes);

    /**
     * Get audit logs with various filters
     */
    List<AuditLog> getAuditLogs(AuditAction action, Long adminId, String entityType, LocalDateTime from, LocalDateTime to);

    /**
     * Get all audit logs for a specific entity
     */
    List<AuditLog> getEntityAuditHistory(String entityType, Long entityId);

    /**
     * Get all audit logs by a specific admin
     */
    List<AuditLog> getAdminAuditHistory(Long adminId);

    /**
     * Get audit logs within a date range
     */
    List<AuditLog> getAuditLogsBetweenDates(LocalDateTime from, LocalDateTime to);

    /**
     * Get audit logs by action
     */
    List<AuditLog> getAuditLogsByAction(AuditAction action);

    /**
     * Get all audit logs (most recent first)
     */
    List<AuditLog> getAllAuditLogs();
}
