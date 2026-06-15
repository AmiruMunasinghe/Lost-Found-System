package uom.msd.lostfound.services;

import uom.msd.lostfound.dto.RewardBalanceResponse;
import uom.msd.lostfound.dto.RewardLedgerEntryResponse;
import uom.msd.lostfound.dto.RewardTransactionRequest;
import uom.msd.lostfound.models.RewardLedgerEntry;
import uom.msd.lostfound.enums.RewardTransactionType;
import uom.msd.lostfound.repositories.RewardLedgerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RewardService {

    private final RewardLedgerRepository rewardLedgerRepository;

    /**
     * Credits or debits points for a user and returns the ledger entry.
     */
    @Transactional
    public RewardLedgerEntryResponse recordTransaction(RewardTransactionRequest request) {
        if (request.getTransactionType() == RewardTransactionType.DEBIT) {
            int balance = rewardLedgerRepository.calculateBalanceByUserId(request.getUserId());
            if (balance < request.getPoints()) {
                throw new IllegalStateException(
                        "Insufficient reward points. Current balance: " + balance);
            }
        }

        RewardLedgerEntry entry = RewardLedgerEntry.builder()
                .userId(request.getUserId())
                .points(request.getPoints())
                .transactionType(request.getTransactionType())
                .description(request.getDescription())
                .referenceId(request.getReferenceId())
                .build();

        entry = rewardLedgerRepository.save(entry);
        log.info("Reward {} {} points for userId={}. Reason: {}",
                request.getTransactionType(), request.getPoints(),
                request.getUserId(), request.getDescription());

        return toResponse(entry);
    }

    /**
     * Retrieves current balance and full transaction history for a user.
     */
    @Transactional(readOnly = true)
    public RewardBalanceResponse getBalanceAndHistory(Long userId) {
        int balance = rewardLedgerRepository.calculateBalanceByUserId(userId);
        List<RewardLedgerEntryResponse> history = rewardLedgerRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return RewardBalanceResponse.builder()
                .userId(userId)
                .balance(balance)
                .history(history)
                .build();
    }

    /**
     * Returns only the current point balance for a user.
     */
    @Transactional(readOnly = true)
    public int getBalance(Long userId) {
        return rewardLedgerRepository.calculateBalanceByUserId(userId);
    }

    // ─── Mapper ──────────────────────────────────────────────────────────────

    private RewardLedgerEntryResponse toResponse(RewardLedgerEntry e) {
        return RewardLedgerEntryResponse.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .points(e.getPoints())
                .transactionType(e.getTransactionType())
                .description(e.getDescription())
                .referenceId(e.getReferenceId())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
