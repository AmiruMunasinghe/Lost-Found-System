package uom.msd.lostfound.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uom.msd.lostfound.enums.MatchStatus;
import uom.msd.lostfound.models.ItemMatch;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemMatchRepository extends JpaRepository<ItemMatch, Long> {

    List<ItemMatch> findByLostItemId(Long lostItemId);

    List<ItemMatch> findByFoundItemId(Long foundItemId);

    List<ItemMatch> findByStatus(MatchStatus status);

    Optional<ItemMatch> findByLostItemIdAndFoundItemId(Long lostItemId, Long foundItemId);

    @Query("SELECT im FROM ItemMatch im WHERE im.lostItem.id = :itemId OR im.foundItem.id = :itemId")
    List<ItemMatch> findMatchesByItemId(@Param("itemId") Long itemId);

    @Query("SELECT im FROM ItemMatch im WHERE im.status = :status AND im.confidenceScore >= :minScore ORDER BY im.confidenceScore DESC")
    List<ItemMatch> findByStatusAndMinConfidenceScore(
            @Param("status") MatchStatus status,
            @Param("minScore") java.math.BigDecimal minScore
    );

    @Query("SELECT COUNT(im) FROM ItemMatch im WHERE im.lostItem.id = :itemId AND im.status = :status")
    long countByLostItemIdAndStatus(@Param("itemId") Long itemId, @Param("status") MatchStatus status);
}
