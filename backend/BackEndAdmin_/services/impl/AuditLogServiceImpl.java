package uom.msd.lostfound.services.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uom.msd.lostfound.enums.AuditAction;
import uom.msd.lostfound.models.AuditLog;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.AuditLogRepository;
import uom.msd.lostfound.repositories.UserRepository;
import uom.msd.lostfound.services.AuditLogService;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@Transactional
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    public AuditLog logAction(Long adminId, AuditAction action, String entityType, Long entityId, 
                             String outcome, String notes) {
        User admin = null;
        if (adminId != null) {
            admin = userRepository.findById(adminId).orElse(null);
        }

        AuditLog auditLog = new AuditLog(admin, action, entityType, entityId, outcome);
        auditLog.setNotes(notes);

        AuditLog saved = auditLogRepository.save(auditLog);
        log.debug("Audit logged: action={}, entity={}:{}, outcome={}", action, entityType, entityId, outcome);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogs(AuditAction action, Long adminId, String entityType, 
                                       LocalDateTime from, LocalDateTime to) {
        // If we have specific filters, use them; otherwise return all
        if (action != null && entityType != null) {
            return auditLogRepository.findByActionAndEntity(action, entityType, null);
        } else if (action != null) {
            return auditLogRepository.findByAction(action);
        } else if (adminId != null && from != null && to != null) {
            return auditLogRepository.findByAdminIdAndTimestampBetween(adminId, from, to);
        } else if (from != null && to != null) {
            return auditLogRepository.findByTimestampBetween(from, to);
        } else if (adminId != null) {
            return auditLogRepository.findByAdminId(adminId);
        }
        
        return auditLogRepository.findAllOrderByTimestampDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getEntityAuditHistory(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAdminAuditHistory(Long adminId) {
        return auditLogRepository.findByAdminId(adminId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsBetweenDates(LocalDateTime from, LocalDateTime to) {
        return auditLogRepository.findByTimestampBetween(from, to);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByAction(AuditAction action) {
        return auditLogRepository.findByAction(action);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllOrderByTimestampDesc();
    }
}
