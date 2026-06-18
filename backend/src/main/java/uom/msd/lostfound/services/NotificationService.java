package uom.msd.lostfound.services;

import uom.msd.lostfound.dto.NotificationResponse;
import uom.msd.lostfound.dto.SendNotificationRequest;
import uom.msd.lostfound.emails.EmailService;
import uom.msd.lostfound.models.Notification;
import uom.msd.lostfound.enums.NotificationChannel;
import uom.msd.lostfound.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    /**
     * Sends a notification via the configured channel(s) and persists an in-app record.
     */
    @Transactional
    public NotificationResponse sendNotification(SendNotificationRequest request) {
        // Persist in-app notification
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .channel(request.getChannel())
                .referenceItemId(request.getReferenceItemId())
                .build();
        notification = notificationRepository.save(notification);

        // Send email if channel demands it
        if (request.getChannel() == NotificationChannel.EMAIL
                || request.getChannel() == NotificationChannel.BOTH) {
            String email = request.getRecipientEmail();
            if (email != null && !email.isBlank()) {
                emailService.sendGenericEmail(email, request.getTitle(),
                        request.getTitle(), request.getMessage());
            } else {
                log.warn("Email channel requested but no recipientEmail provided for userId={}",
                        request.getUserId());
            }
        }

        return toResponse(notification);
    }

    /**
     * Returns all notifications for a user (newest first).
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns only unread notifications for a user.
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns the count of unread notifications for a user.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * Marks a single notification as read.
     */
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Notification not found: " + notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new SecurityException("Access denied to notification: " + notificationId);
        }

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        return toResponse(notificationRepository.save(notification));
    }

    /**
     * Marks all notifications for a user as read.
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }

    // ─── Mapper ──────────────────────────────────────────────────────────────

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .read(n.isRead())
                .channel(n.getChannel())
                .referenceItemId(n.getReferenceItemId())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .build();
    }
}
