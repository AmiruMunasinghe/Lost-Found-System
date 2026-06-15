package uom.msd.lostfound.controllers;

import uom.msd.lostfound.dto.NotificationResponse;
import uom.msd.lostfound.dto.SendNotificationRequest;
import uom.msd.lostfound.services.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * POST /api/notifications
     * Send a new notification (called internally by other modules / matching service).
     */
    @PostMapping
    public ResponseEntity<NotificationResponse> sendNotification(
            @Valid @RequestBody SendNotificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.sendNotification(request));
    }

    /**
     * GET /api/notifications/users/{userId}
     * Retrieve all notifications for a given user (newest first).
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(
            @PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    /**
     * GET /api/notifications/users/{userId}/unread
     * Retrieve only unread notifications for a given user.
     */
    @GetMapping("/users/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForUser(userId));
    }

    /**
     * GET /api/notifications/users/{userId}/unread-count
     * Returns the count of unread notifications for a user.
     */
    @GetMapping("/users/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    /**
     * PATCH /api/notifications/{notificationId}/read?userId={userId}
     * Mark a single notification as read.
     */
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId, userId));
    }

    /**
     * PATCH /api/notifications/users/{userId}/read-all
     * Mark all notifications for a user as read.
     */
    @PatchMapping("/users/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
