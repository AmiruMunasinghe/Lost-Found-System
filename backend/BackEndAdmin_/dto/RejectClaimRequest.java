package uom.msd.lostfound.dto;

/**
 * DTO for rejecting a claim
 */
public class RejectClaimRequest {
    private String reason;

    public RejectClaimRequest() {
    }

    public RejectClaimRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
