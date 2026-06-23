# Matching Engine – Team 3
### University Lost and Found Management System · Group D · University of Moratuwa

---

## Overview

This module owns the **lost ↔ found similarity scoring pipeline** for the system.  
It is a Spring Boot service consumed internally by the Item & Report Service (Team 5) and  
exposes a REST API used by the Admin Dashboard (Team 7 / Team 9) for manual review.

---

## Scoring Algorithm

A **composite confidence score (0–100)** is produced by four weighted signals:

| Signal             | Weight | Method                                      |
|--------------------|--------|---------------------------------------------|
| Text description   | 60 %   | TF-IDF cosine similarity + Jaccard overlap  |
| Location proximity | 20 %   | Haversine (GPS) or keyword fallback         |
| Temporal proximity | 10 %   | Linear decay over 30-day window             |
| Category match     | 10 %   | Exact case-insensitive match                |

### Thresholds (configurable in `application.yml`)

| Range       | Action                                         |
|-------------|------------------------------------------------|
| ≥ 75        | Auto-notify users (high-confidence match)      |
| 45 – 74     | Sent to **manual review queue** for admin      |
| < 45        | Silently discarded                             |

---

## REST API

Base path: `/api/v1/matches`

| Method | Path                              | Auth         | Description                          |
|--------|-----------------------------------|--------------|--------------------------------------|
| POST   | `/trigger/lost/{lostItemId}`      | INTERNAL/ADMIN | Run pipeline for a new lost item   |
| POST   | `/trigger/found/{foundItemId}`    | INTERNAL/ADMIN | Run pipeline for a new found item  |
| POST   | `/recalculate`                    | ADMIN        | Re-score a specific pair             |
| GET    | `/lost/{lostItemId}?limit=5`      | USER/ADMIN   | Top-N ranked matches for lost item   |
| GET    | `/{matchId}`                      | USER/ADMIN   | Single match detail                  |
| POST   | `/{matchId}/confirm`              | USER/ADMIN   | Confirm a match (ownership claim)    |
| POST   | `/{matchId}/reject`               | USER/ADMIN   | Reject a match                       |
| GET    | `/queue`                          | ADMIN only   | Paginated manual review queue        |
| POST   | `/queue/{matchId}/resolve`        | ADMIN only   | Approve or reject a queued match     |

Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## Event Publishing (RabbitMQ)

Exchange: `lostfound.events` (topic)

| Routing Key             | Trigger                            | Consumer        |
|-------------------------|------------------------------------|-----------------|
| `match.high_confidence` | Score ≥ 75 match created           | Team 8 (Notify) |
| `match.confirmed`       | User confirms ownership            | Team 8 (Notify) |
| `match.review.queued`   | Borderline match queued for admin  | Team 7 (Admin)  |

---

## Database Schema

Two tables managed by this module (Flyway: `V1__create_matching_tables.sql`):

- **`match`** – stores scored pairs with status lifecycle (PENDING → CONFIRMED/REJECTED)
- **`manual_review_queue`** – borderline matches awaiting admin review; includes `score_breakdown` JSONB for full transparency

---

## Running Locally

```bash
# Prerequisites: Java 21, PostgreSQL, RabbitMQ
./mvnw spring-boot:run \
  -Dspring-boot.run.arguments="
    --DB_URL=jdbc:postgresql://localhost:5432/lostfound
    --DB_USER=lostfound
    --DB_PASS=secret
    --RABBITMQ_HOST=localhost"
```

## Tests

```bash
./mvnw test                    # runs all unit tests
./mvnw verify                  # runs tests + JaCoCo 80% coverage gate
```

---

## Key Files

```
src/
├── main/java/com/uom/lostfound/matching/
│   ├── algorithm/
│   │   └── SimilarityScorer.java         ← Core scoring logic (TF-IDF, Jaccard, Haversine)
│   ├── service/
│   │   ├── MatchingEngineService.java     ← Orchestrates full pipeline
│   │   └── ManualReviewQueueService.java  ← Admin review workflow
│   ├── controller/
│   │   └── MatchController.java           ← REST API
│   ├── queue/
│   │   └── MatchEventPublisher.java       ← RabbitMQ event publishing
│   ├── model/                             ← JPA entities + enums
│   ├── dto/                               ← Request/Response DTOs
│   └── repository/                        ← Spring Data JPA repos
└── resources/
    ├── application.yml
    └── db/migration/V1__create_matching_tables.sql
```

---

## Team 3 – Module Responsibility Matrix

| Deliverable                    | Owner    |
|--------------------------------|----------|
| ER Diagram                     | Team 3   |
| Full Class Diagram             | Team 3   |
| Backend – Matching Engine      | Team 3   |
