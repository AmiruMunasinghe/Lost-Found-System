package uom.msd.lostfound.controllers;

import uom.msd.lostfound.dto.RewardBalanceResponse;
import uom.msd.lostfound.dto.RewardLedgerEntryResponse;
import uom.msd.lostfound.dto.RewardTransactionRequest;
import uom.msd.lostfound.services.RewardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;

    /**
     * POST /api/rewards/transactions
     * Record a credit or debit transaction for a user.
     */
    @PostMapping("/transactions")
    public ResponseEntity<RewardLedgerEntryResponse> recordTransaction(
            @Valid @RequestBody RewardTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(rewardService.recordTransaction(request));
    }

    /**
     * GET /api/rewards/users/{userId}
     * Get balance and full transaction history for a user.
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<RewardBalanceResponse> getBalanceAndHistory(
            @PathVariable Long userId) {
        return ResponseEntity.ok(rewardService.getBalanceAndHistory(userId));
    }

    /**
     * GET /api/rewards/users/{userId}/balance
     * Get current point balance for a user.
     */
    @GetMapping("/users/{userId}/balance")
    public ResponseEntity<Map<String, Integer>> getBalance(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("balance", rewardService.getBalance(userId)));
    }
}
