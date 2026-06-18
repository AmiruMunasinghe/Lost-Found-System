package uom.msd.lostfound.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import uom.msd.lostfound.enums.ClaimStatus;
import uom.msd.lostfound.models.Claim;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    /**
     * Find all claims with a specific status
     */
    List<Claim> findByStatus(ClaimStatus status);

    /**
     * Find all claims by claimant
     */
    List<Claim> findByClaimantId(Long claimantId);

    /**
     * Find claim by item match ID
     */
    Optional<Claim> findByItemMatchId(Long itemMatchId);

    /**
     * Find claims by status within a date range (for analytics)
     */
    @Query("SELECT c FROM Claim c WHERE c.status = :status AND c.requestedAt BETWEEN :from AND :to")
    List<Claim> findByStatusAndCreatedAtBetween(@Param("status") ClaimStatus status,
                                                 @Param("from") LocalDateTime from,
                                                 @Param("to") LocalDateTime to);

    /**
     * Find all claims created within a date range
     */
    @Query("SELECT c FROM Claim c WHERE c.requestedAt BETWEEN :from AND :to")
    List<Claim> findByCreatedAtBetween(@Param("from") LocalDateTime from,
                                        @Param("to") LocalDateTime to);

    /**
     * Count claims by status
     */
    Long countByStatus(ClaimStatus status);

    /**
     * Find all claims with pagination support (for listing)
     */
    @Query("SELECT c FROM Claim c ORDER BY c.requestedAt DESC")
    List<Claim> findAllOrderByRequestedAtDesc();
}
