package uom.msd.lostfound.dto;

import java.time.LocalDateTime;

/**
 * DTO for scheduling a pickup
 */
public class PickupScheduleDTO {
    private LocalDateTime pickupAt;
    private String location;

    public PickupScheduleDTO() {
    }

    public PickupScheduleDTO(LocalDateTime pickupAt, String location) {
        this.pickupAt = pickupAt;
        this.location = location;
    }

    public LocalDateTime getPickupAt() {
        return pickupAt;
    }

    public void setPickupAt(LocalDateTime pickupAt) {
        this.pickupAt = pickupAt;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
