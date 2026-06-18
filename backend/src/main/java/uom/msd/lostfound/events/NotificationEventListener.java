package uom.msd.lostfound.events;

import uom.msd.lostfound.dto.SendNotificationRequest;
import uom.msd.lostfound.dto.RewardTransactionRequest;
import uom.msd.lostfound.enums.NotificationChannel;
import uom.msd.lostfound.enums.NotificationType;
import uom.msd.lostfound.enums.RewardTransactionType;
import uom.msd.lostfound.services.NotificationService;
import uom.msd.lostfound.services.RewardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Consumes internal application events and triggers notifications / reward updates.
 *
 * This acts as the "event queue consumer" for the module. In a microservice setup,
 * this listener can be replaced with a RabbitMQ/Kafka consumer without changing any
 * service logic — only this class needs updating.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final RewardService rewardService;

    @Value("${app.rewards.points-per-found-item:50}")
    private int pointsPerFoundItem;

    @Value("${app.rewards.points-per-claimed-item:20}")
    private int pointsPerClaimedItem;

    // ─── Item Matched ─────────────────────────────────────────────────────────

    @Async
    @EventListener
    public void handleItemMatched(ItemMatchedEvent event) {
        log.info("Processing ItemMatchedEvent for userId={}", event.getLostItemOwnerId());

        String message = String.format(
                "A possible match was found for your lost item '%s'. " +
                "A '%s' was found at '%s'. Please check the portal to confirm.",
                event.getLostItemName(),
                event.getFoundItemDescription(),
                event.getFoundLocation());

        SendNotificationRequest req = new SendNotificationRequest();
        req.setUserId(event.getLostItemOwnerId());
        req.setType(NotificationType.ITEM_MATCH);
        req.setTitle("Possible Match Found: " + event.getLostItemName());
        req.setMessage(message);
        req.setChannel(NotificationChannel.IN_APP);
        req.setReferenceItemId(event.getFoundItemId());

        notificationService.sendNotification(req);
    }

    // ─── Found Item Submitted ─────────────────────────────────────────────────

    @Async
    @EventListener
    public void handleFoundItemSubmitted(FoundItemSubmittedEvent event) {
        log.info("Processing FoundItemSubmittedEvent for finderId={}", event.getFinderId());

        // Credit reward points
        RewardTransactionRequest rewardReq = new RewardTransactionRequest();
        rewardReq.setUserId(event.getFinderId());
        rewardReq.setPoints(pointsPerFoundItem);
        rewardReq.setTransactionType(RewardTransactionType.CREDIT);
        rewardReq.setDescription("Submitted found item: " + event.getItemName());
        rewardReq.setReferenceId(event.getFoundItemId());
        rewardService.recordTransaction(rewardReq);

        int newBalance = rewardService.getBalance(event.getFinderId());

        // In-app notification
        SendNotificationRequest notifReq = new SendNotificationRequest();
        notifReq.setUserId(event.getFinderId());
        notifReq.setType(NotificationType.REWARD_EARNED);
        notifReq.setTitle("You Earned " + pointsPerFoundItem + " Reward Points!");
        notifReq.setMessage("Thank you for submitting a found item. You earned " +
                pointsPerFoundItem + " points. Your balance: " + newBalance + " points.");
        notifReq.setChannel(NotificationChannel.IN_APP);
        notifReq.setReferenceItemId(event.getFoundItemId());
        notificationService.sendNotification(notifReq);
    }

    // ─── Item Claimed ─────────────────────────────────────────────────────────

    @Async
    @EventListener
    public void handleItemClaimed(ItemClaimedEvent event) {
        log.info("Processing ItemClaimedEvent for itemId={}", event.getItemId());

        // Notify owner
        SendNotificationRequest ownerNotif = new SendNotificationRequest();
        ownerNotif.setUserId(event.getOwnerId());
        ownerNotif.setType(NotificationType.ITEM_RETURNED);
        ownerNotif.setTitle("Your Item Has Been Returned: " + event.getItemName());
        ownerNotif.setMessage("Your item '" + event.getItemName() +
                "' has been successfully returned. Thank you for using the Lost & Found system.");
        ownerNotif.setChannel(NotificationChannel.IN_APP);
        ownerNotif.setReferenceItemId(event.getItemId());
        notificationService.sendNotification(ownerNotif);

        // Credit points to finder for successful return
        if (event.getFinderId() != null) {
            RewardTransactionRequest finderReward = new RewardTransactionRequest();
            finderReward.setUserId(event.getFinderId());
            finderReward.setPoints(pointsPerClaimedItem);
            finderReward.setTransactionType(RewardTransactionType.CREDIT);
            finderReward.setDescription("Item successfully claimed by owner: " + event.getItemName());
            finderReward.setReferenceId(event.getItemId());
            rewardService.recordTransaction(finderReward);

            SendNotificationRequest finderNotif = new SendNotificationRequest();
            finderNotif.setUserId(event.getFinderId());
            finderNotif.setType(NotificationType.ITEM_CLAIMED);
            finderNotif.setTitle("Item Returned to Owner – Bonus Points!");
            finderNotif.setMessage("The item '" + event.getItemName() +
                    "' you submitted has been claimed by its owner. " +
                    "You earned an additional " + pointsPerClaimedItem + " points!");
            finderNotif.setChannel(NotificationChannel.IN_APP);
            finderNotif.setReferenceItemId(event.getItemId());
            notificationService.sendNotification(finderNotif);
        }
    }
}
