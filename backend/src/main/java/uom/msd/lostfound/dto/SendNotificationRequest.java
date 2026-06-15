package uom.msd.lostfound.dto;

import uom.msd.lostfound.enums.NotificationChannel;
import uom.msd.lostfound.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendNotificationRequest {

    @NotNull
    private Long userId;

    @NotNull
    private NotificationType type;

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    @NotNull
    private NotificationChannel channel;

    private Long referenceItemId;

    /** Required when channel is EMAIL or BOTH */
    private String recipientEmail;
}
