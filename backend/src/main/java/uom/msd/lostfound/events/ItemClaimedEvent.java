package uom.msd.lostfound.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Published when an item is successfully claimed and returned to its owner.
 * Triggers a reward credit for the finder and a confirmation notification for the owner.
 */
@Getter
public class ItemClaimedEvent extends ApplicationEvent {

    private final Long ownerId;
    private final String ownerEmail;
    private final Long finderId;
    private final String finderEmail;
    private final Long itemId;
    private final String itemName;

    public ItemClaimedEvent(Object source,
                            Long ownerId,
                            String ownerEmail,
                            Long finderId,
                            String finderEmail,
                            Long itemId,
                            String itemName) {
        super(source);
        this.ownerId = ownerId;
        this.ownerEmail = ownerEmail;
        this.finderId = finderId;
        this.finderEmail = finderEmail;
        this.itemId = itemId;
        this.itemName = itemName;
    }
}
