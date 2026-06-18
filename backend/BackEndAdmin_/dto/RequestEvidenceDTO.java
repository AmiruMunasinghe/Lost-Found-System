package uom.msd.lostfound.dto;

/**
 * DTO for requesting evidence from a claimant
 */
public class RequestEvidenceDTO {
    private String message;

    public RequestEvidenceDTO() {
    }

    public RequestEvidenceDTO(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
