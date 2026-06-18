package uom.msd.lostfound.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import uom.msd.lostfound.auth.AuthenticatedUser;
import uom.msd.lostfound.dto.AuditLogResponseDTO;
import uom.msd.lostfound.enums.AuditAction;
import uom.msd.lostfound.models.AuditLog;
import uom.msd.lostfound.services.AuditLogService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for admin audit logging
 */
@Slf4j
@RestController
@RequestMapping("/admin/audit-log")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminAuditController {

    @Autowired
    private AuditLogService auditLogService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    /**
     * Get audit logs with optional filters
     * GET /admin/audit-log?action=APPROVE_CLAIM&adminId=1&entityType=Claim&from=2024-01-01T00:00:00&to=2024-12-31T23:59:59&page=0&size=50
     */
    @GetMapping
    public ResponseEntity<List<AuditLogResponseDTO>> getAuditLogs(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) Long adminId,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            LocalDateTime fromDateTime = null;
            LocalDateTime toDateTime = null;

            // Parse date parameters if provided
            if (from != null && !from.isEmpty()) {
                try {
                    fromDateTime = LocalDateTime.parse(from, DATE_FORMATTER);
                } catch (Exception e) {
                    log.warn("Invalid 'from' date format: {}", from);
                }
            }

            if (to != null && !to.isEmpty()) {
                try {
                    toDateTime = LocalDateTime.parse(to, DATE_FORMATTER);
                } catch (Exception e) {
                    log.warn("Invalid 'to' date format: {}", to);
                }
            }

            List<AuditLog> logs = auditLogService.getAuditLogs(action, adminId, entityType, 
                    fromDateTime, toDateTime);

            // Apply pagination manually (Spring Data Pageable is optional here)
            int start = page * size;
            int end = Math.min(start + size, logs.size());
            List<AuditLog> paginatedLogs = logs.subList(start, end);

            List<AuditLogResponseDTO> dtos = paginatedLogs.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            log.info("Retrieved {} audit logs", dtos.size());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error retrieving audit logs", e);
            throw e;
        }
    }

    /**
     * Get audit history for a specific entity
     * GET /admin/audit-log/entity/Claim/123
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLogResponseDTO>> getEntityAuditHistory(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        try {
            List<AuditLog> logs = auditLogService.getEntityAuditHistory(entityType, entityId);
            List<AuditLogResponseDTO> dtos = logs.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            log.info("Retrieved {} audit logs for entity {}:{}", dtos.size(), entityType, entityId);
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error retrieving entity audit history for {}:{}", entityType, entityId, e);
            throw e;
        }
    }

    /**
     * Get audit history for a specific admin user
     * GET /admin/audit-log/admin/5
     */
    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<AuditLogResponseDTO>> getAdminAuditHistory(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable Long adminId) {
        try {
            List<AuditLog> logs = auditLogService.getAdminAuditHistory(adminId);
            List<AuditLogResponseDTO> dtos = logs.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            log.info("Retrieved {} audit logs for admin {}", dtos.size(), adminId);
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error retrieving admin audit history for admin {}", adminId, e);
            throw e;
        }
    }

    /**
     * Get all audit logs (most recent first)
     * GET /admin/audit-log/all?page=0&size=100
     */
    @GetMapping("/all")
    public ResponseEntity<List<AuditLogResponseDTO>> getAllAuditLogs(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        try {
            List<AuditLog> logs = auditLogService.getAllAuditLogs();

            // Apply pagination manually
            int start = page * size;
            int end = Math.min(start + size, logs.size());
            List<AuditLog> paginatedLogs = logs.subList(start, end);

            List<AuditLogResponseDTO> dtos = paginatedLogs.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            log.info("Retrieved {} audit logs (page {}, size {})", dtos.size(), page, size);
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error retrieving all audit logs", e);
            throw e;
        }
    }

    /**
     * Convert AuditLog entity to AuditLogResponseDTO
     */
    private AuditLogResponseDTO convertToDTO(AuditLog log) {
        String adminUsername = null;
        Long adminId = null;

        if (log.getAdmin() != null) {
            adminUsername = log.getAdmin().getUsername();
            adminId = log.getAdmin().getId();
        }

        return new AuditLogResponseDTO(
                log.getId(),
                adminUsername,
                adminId,
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getOutcome(),
                log.getNotes(),
                log.getTimestamp()
        );
    }
}
