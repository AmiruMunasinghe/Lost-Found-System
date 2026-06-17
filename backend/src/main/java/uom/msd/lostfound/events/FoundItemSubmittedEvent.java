package uom.msd.lostfound.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Published when a found item is submitted by a user.
 * Used to credit reward points to the finder.
 */
@Getter
public class FoundItemSubmittedEvent extends ApplicationEvent {

    private final Long finderId;
    private final String finderEmail;
    private final Long foundItemId;
    private final String itemName;

    public FoundItemSubmittedEvent(Object source,
                                   Long finderId,
                                   String finderEmail,
                                   Long foundItemId,
                                   String itemName) {
        super(source);
        this.finderId = finderId;
        this.finderEmail = finderEmail;
        this.foundItemId = foundItemId;
        this.itemName = itemName;
    }
}
