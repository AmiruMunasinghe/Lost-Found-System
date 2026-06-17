package uom.msd.lostfound.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import uom.msd.lostfound.enums.AuditAction;
import uom.msd.lostfound.models.AuditLog;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    /**
     * Find all audit logs with a specific action
     */
    List<AuditLog> findByAction(AuditAction action);

    /**
     * Find all audit logs by a specific admin
     */
    List<AuditLog> findByAdminId(Long adminId);

    /**
     * Find audit logs within a date range
     */
    @Query("SELECT al FROM AuditLog al WHERE al.timestamp BETWEEN :from AND :to ORDER BY al.timestamp DESC")
    List<AuditLog> findByTimestampBetween(@Param("from") LocalDateTime from,
                                          @Param("to") LocalDateTime to);

    /**
     * Find audit logs for a specific admin within a date range
     */
    @Query("SELECT al FROM AuditLog al WHERE al.admin.id = :adminId AND al.timestamp BETWEEN :from AND :to ORDER BY al.timestamp DESC")
    List<AuditLog> findByAdminIdAndTimestampBetween(@Param("adminId") Long adminId,
                                                     @Param("from") LocalDateTime from,
                                                     @Param("to") LocalDateTime to);

    /**
     * Find all audit logs for a specific entity (by entity type and ID)
     */
    @Query("SELECT al FROM AuditLog al WHERE al.entityType = :entityType AND al.entityId = :entityId ORDER BY al.timestamp DESC")
    List<AuditLog> findByEntityTypeAndEntityId(@Param("entityType") String entityType,
                                               @Param("entityId") Long entityId);

    /**
     * Find audit logs by action and entity
     */
    @Query("SELECT al FROM AuditLog al WHERE al.action = :action AND al.entityType = :entityType AND al.entityId = :entityId ORDER BY al.timestamp DESC")
    List<AuditLog> findByActionAndEntity(@Param("action") AuditAction action,
                                         @Param("entityType") String entityType,
                                         @Param("entityId") Long entityId);

    /**
     * Get all audit logs ordered by timestamp (newest first)
     */
    @Query("SELECT al FROM AuditLog al ORDER BY al.timestamp DESC")
    List<AuditLog> findAllOrderByTimestampDesc();
}
