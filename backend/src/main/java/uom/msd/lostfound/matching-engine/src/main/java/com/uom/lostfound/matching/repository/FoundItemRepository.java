package com.uom.lostfound.matching.repository;

import com.uom.lostfound.matching.model.FoundItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface FoundItemRepository extends JpaRepository<FoundItem, UUID> {

    /**
     * Retrieves active (non-deleted, status=OPEN) found items of the same category,
     * reported within 30 days of the given referenceDate.
     */
    @Query("""
            SELECT f FROM FoundItem f
            WHERE f.category = :category
              AND f.isDeleted = false
              AND f.status = 'OPEN'
              AND ABS(DATEDIFF(f.dateFound, :referenceDate)) <= 30
            """)
    List<FoundItem> findActiveCandidates(
            @Param("category") String category,
            @Param("referenceDate") LocalDateTime referenceDate);
}
