package uom.msd.lostfound.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Published by the matching service (or any other module) when a lost item
 * matches a found item. This event is consumed by the NotificationEventListener
 * to trigger email and in-app alerts.
 */
@Getter
public class ItemMatchedEvent extends ApplicationEvent {

    private final Long lostItemOwnerId;
    private final String lostItemOwnerEmail;
    private final String lostItemName;
    private final Long foundItemId;
    private final String foundItemDescription;
    private final String foundLocation;

    public ItemMatchedEvent(Object source,
                            Long lostItemOwnerId,
                            String lostItemOwnerEmail,
                            String lostItemName,
                            Long foundItemId,
                            String foundItemDescription,
                            String foundLocation) {
        super(source);
        this.lostItemOwnerId = lostItemOwnerId;
        this.lostItemOwnerEmail = lostItemOwnerEmail;
        this.lostItemName = lostItemName;
        this.foundItemId = foundItemId;
        this.foundItemDescription = foundItemDescription;
        this.foundLocation = foundLocation;
    }
}
