package uom.msd.lostfound.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import uom.msd.lostfound.enums.EvidenceStatus;
import uom.msd.lostfound.models.EvidenceRequest;

import java.util.List;

@Repository
public interface EvidenceRequestRepository extends JpaRepository<EvidenceRequest, Long> {
    /**
     * Find all evidence requests for a claim
     */
    List<EvidenceRequest> findByClaimId(Long claimId);

    /**
     * Find all evidence requests with a specific status
     */
    List<EvidenceRequest> findByStatus(EvidenceStatus status);

    /**
     * Count evidence requests for a claim
     */
    Long countByClaimId(Long claimId);

    /**
     * Count pending evidence requests for a claim
     */
    Long countByClaimIdAndStatus(Long claimId, EvidenceStatus status);
}
