package uom.msd.lostfound.exceptions;

/**
 * Exception thrown when an invalid claim status transition is attempted
 */
public class InvalidClaimStatusTransitionException extends RuntimeException {
    public InvalidClaimStatusTransitionException(String message) {
        super(message);
    }

    public InvalidClaimStatusTransitionException(String message, Throwable cause) {
        super(message, cause);
    }
}
