package com.uom.lostfound.matching.exception;

import java.util.UUID;

/**
 * Exception thrown when a match is not found in the repository.
 */
public class MatchNotFoundException extends RuntimeException {
    public MatchNotFoundException(String message) {
        super(message);
    }

    public MatchNotFoundException(UUID matchId) {
        super("Match not found: " + matchId);
    }

    public MatchNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
