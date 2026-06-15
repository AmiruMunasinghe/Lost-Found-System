package com.uom.lostfound.matching.repository;

import com.uom.lostfound.matching.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MatchRepository extends JpaRepository<Match, UUID> {

    Optional<Match> findByLostItemIdAndFoundItemId(UUID lostItemId, UUID foundItemId);

    @Query(value = """
            SELECT m FROM Match m
            WHERE m.lostItemId = :lostItemId
              AND m.status <> 'REJECTED'
            ORDER BY m.confidenceScore DESC
            LIMIT :limit
            """)
    List<Match> findByLostItemIdOrderByConfidenceScoreDesc(
            @Param("lostItemId") UUID lostItemId,
            @Param("limit") int limit);

    @Query(value = """
            SELECT m FROM Match m
            WHERE m.foundItemId = :foundItemId
              AND m.status <> 'REJECTED'
            ORDER BY m.confidenceScore DESC
            LIMIT :limit
            """)
    List<Match> findByFoundItemIdOrderByConfidenceScoreDesc(
            @Param("foundItemId") UUID foundItemId,
            @Param("limit") int limit);
}
