package uom.msd.lostfound.dto;

import java.util.ArrayList;
import java.util.List;

public class RunMatchingRequest {
    private List<Long> lostItemIds = new ArrayList<>();

    public List<Long> getLostItemIds() {
        return lostItemIds;
    }

    public void setLostItemIds(List<Long> lostItemIds) {
        this.lostItemIds = lostItemIds == null ? new ArrayList<>() : lostItemIds;
    }
}
