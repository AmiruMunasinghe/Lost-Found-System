package com.uom.lostfound.matching.repository;

import com.uom.lostfound.matching.model.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Read-only projection for LostItem used by the Matching Engine.
 * The canonical repository lives in the Item Service (Team 5).
 */
public interface LostItemRepository extends JpaRepository<LostItem, UUID> {

    /**
     * Retrieves active (non-deleted, status=OPEN) lost items of the same category,
     * reported within 30 days of the given referenceDate.
     */
    @Query("""
            SELECT l FROM LostItem l
            WHERE l.category = :category
              AND l.isDeleted = false
              AND l.status = 'OPEN'
              AND ABS(DATEDIFF(l.dateLost, :referenceDate)) <= 30
            """)
    List<LostItem> findActiveCandidates(
            @Param("category") String category,
            @Param("referenceDate") LocalDateTime referenceDate);
}
