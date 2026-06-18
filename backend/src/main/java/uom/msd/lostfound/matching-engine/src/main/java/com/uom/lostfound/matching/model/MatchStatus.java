package com.uom.lostfound.matching.model;

/** Lifecycle states for a matched lost↔found pair. */
public enum MatchStatus {
    PENDING,      // created, awaiting user/admin action
    CONFIRMED,    // ownership verified
    REJECTED      // dismissed by user or admin
}
