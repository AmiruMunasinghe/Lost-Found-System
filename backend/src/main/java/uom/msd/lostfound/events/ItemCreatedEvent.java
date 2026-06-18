package uom.msd.lostfound.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import uom.msd.lostfound.models.Item;

/**
 * Published when a new item (lost or found) is submitted to the system.
 * Triggers similarity matching logic.
 */
@Getter
public class ItemCreatedEvent extends ApplicationEvent {

    private final Item item;

    public ItemCreatedEvent(Object source, Item item) {
        super(source);
        this.item = item;
    }
}
