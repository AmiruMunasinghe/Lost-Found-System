package com.uom.lostfound.matching.exception;

/**
 * Base exception for matching engine errors.
 */
public class MatchingException extends RuntimeException {
    public MatchingException(String message) {
        super(message);
    }

    public MatchingException(String message, Throwable cause) {
        super(message, cause);
    }
}
