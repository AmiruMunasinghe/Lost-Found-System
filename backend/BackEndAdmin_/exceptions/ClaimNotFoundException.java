package uom.msd.lostfound.exceptions;

/**
 * Exception thrown when a claim is not found
 */
public class ClaimNotFoundException extends ResourceNotFoundException {
    public ClaimNotFoundException(String message) {
        super(message);
    }

    public ClaimNotFoundException(Long claimId) {
        super("Claim not found with id: " + claimId);
    }

    public ClaimNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
