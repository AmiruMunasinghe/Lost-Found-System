package uom.msd.lostfound.repositories;

import uom.msd.lostfound.models.RewardLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RewardLedgerRepository extends JpaRepository<RewardLedgerEntry, Long> {

    List<RewardLedgerEntry> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(CASE WHEN e.transactionType = 'CREDIT' THEN e.points ELSE -e.points END), 0) " +
           "FROM RewardLedgerEntry e WHERE e.userId = :userId")
    int calculateBalanceByUserId(@Param("userId") Long userId);
}
