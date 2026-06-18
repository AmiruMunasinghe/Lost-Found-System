package uom.msd.lostfound.enums;

import com.fasterxml.jackson.annotation.JsonAlias;

public enum NotificationType {
    @JsonAlias("ITEM_MATCHED")
    ITEM_MATCH,          // A lost item matched a found item
    ITEM_CLAIMED,        // An item has been claimed
    ITEM_RETURNED,       // An item has been returned to its owner
    REWARD_EARNED,       // User earned reward points
    REWARD_REDEEMED,     // User redeemed reward points
    GENERAL              // General campus announcement
}
