package uom.msd.lostfound.dto;

import uom.msd.lostfound.enums.NotificationChannel;
import uom.msd.lostfound.enums.NotificationType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private Long userId;
    private NotificationType type;
    private String title;
    private String message;
    private boolean isRead;
    private NotificationChannel channel;
    private Long referenceItemId;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
