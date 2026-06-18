package com.uom.lostfound.matching.repository;

import com.uom.lostfound.matching.model.ManualReviewEntry;
import com.uom.lostfound.matching.model.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ManualReviewQueueRepository extends JpaRepository<ManualReviewEntry, UUID> {

    Optional<ManualReviewEntry> findByMatchId(UUID matchId);

    Page<ManualReviewEntry> findByStatusOrderByQueuedAtAsc(ReviewStatus status, Pageable pageable);
}
