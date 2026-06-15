package com.uom.lostfound.matching.queue;

import com.uom.lostfound.matching.model.Match;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Publishes match lifecycle events to RabbitMQ.
 *
 * Consumers:
 * - Notification & Rewards Service (Team 8) – listens on match.* routing keys
 * - Admin & Operations Service (Team 7) – listens on match.review.queued
 *
 * Exchange: lostfound.events (topic)
 *
 * Routing keys:
 * match.high_confidence → high-confidence match created, notify users
 * match.confirmed → user confirmed ownership
 * match.review.queued → borderline match needs admin review
 */
@Component
@RequiredArgsConstructor
public class MatchEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(MatchEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.lostfound:lostfound.events}")
    private String exchange;

    public void publishHighConfidenceMatch(Match match) {
        Map<String, Object> payload = buildPayload(match, "HIGH_CONFIDENCE");
        send("match.high_confidence", payload);
        log.debug("[EventPublisher] Sent match.high_confidence matchId={}", match.getMatchId());
    }

    public void publishMatchConfirmed(Match match) {
        Map<String, Object> payload = buildPayload(match, "CONFIRMED");
        send("match.confirmed", payload);
        log.debug("[EventPublisher] Sent match.confirmed matchId={}", match.getMatchId());
    }

    public void publishManualReviewQueued(Match match) {
        Map<String, Object> payload = buildPayload(match, "MANUAL_REVIEW");
        send("match.review.queued", payload);
        log.debug("[EventPublisher] Sent match.review.queued matchId={}", match.getMatchId());
    }

    private void send(String routingKey, Object payload) {
        rabbitTemplate.convertAndSend(exchange, routingKey, payload);
    }

    private Map<String, Object> buildPayload(Match match, String eventType) {
        return Map.of(
                "eventType", eventType,
                "matchId", match.getMatchId().toString(),
                "lostItemId", match.getLostItemId().toString(),
                "foundItemId", match.getFoundItemId().toString(),
                "confidenceScore", match.getConfidenceScore(),
                "status", match.getStatus().name());
    }
}
