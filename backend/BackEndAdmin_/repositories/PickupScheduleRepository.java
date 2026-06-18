package uom.msd.lostfound.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import uom.msd.lostfound.models.PickupSchedule;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PickupScheduleRepository extends JpaRepository<PickupSchedule, Long> {
    /**
     * Find pickup schedule by claim ID
     */
    Optional<PickupSchedule> findByClaimId(Long claimId);

    /**
     * Find all pickup schedules within a date range (for analytics)
     */
    @Query("SELECT ps FROM PickupSchedule ps WHERE ps.scheduledAt BETWEEN :from AND :to")
    List<PickupSchedule> findByScheduledAtBetween(@Param("from") LocalDateTime from,
                                                   @Param("to") LocalDateTime to);

    /**
     * Find all confirmed pickups
     */
    @Query("SELECT ps FROM PickupSchedule ps WHERE ps.handoverConfirmedAt IS NOT NULL")
    List<PickupSchedule> findConfirmedPickups();

    /**
     * Count confirmed pickups within a date range
     */
    @Query("SELECT COUNT(ps) FROM PickupSchedule ps WHERE ps.handoverConfirmedAt BETWEEN :from AND :to")
    Long countConfirmedBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
