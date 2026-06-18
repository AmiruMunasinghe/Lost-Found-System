# Lost & Found Management System — Complete Technical Documentation

> **Generated from actual source code.** All class names, field names, endpoints, and configuration values are taken directly from the implementation.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Backend — Project Structure](#4-backend--project-structure)
5. [Database Entities (Models)](#5-database-entities-models)
6. [Enumerations](#6-enumerations)
7. [Data Transfer Objects (DTOs)](#7-data-transfer-objects-dtos)
8. [Repositories (Data Access Layer)](#8-repositories-data-access-layer)
9. [Services (Business Logic Layer)](#9-services-business-logic-layer)
10. [REST API Endpoints — Controllers](#10-rest-api-endpoints--controllers)
11. [Matching Engine](#11-matching-engine)
12. [Event System](#12-event-system)
13. [Email Service](#13-email-service)
14. [Authentication & Security](#14-authentication--security)
15. [Exception Handling](#15-exception-handling)
16. [Application Configuration](#16-application-configuration)
17. [Frontend — Project Structure](#17-frontend--project-structure)
18. [Frontend API Integration Layer](#18-frontend-api-integration-layer)
19. [Frontend Application Routing](#19-frontend-application-routing)
20. [Admin Frontend](#20-admin-frontend)
21. [Data Flow Diagrams](#21-data-flow-diagrams)
22. [Development Setup](#22-development-setup)

---

## 1. Project Overview

The **Lost & Found Management System** is a full-stack web application for a university campus. It allows students and staff to report lost and found items, be automatically matched with probable counterparts, submit claims for matched items, and receive notifications through the system. Administrators manage claims, view analytics, and maintain audit logs of all actions.

**Three deployable applications:**

| Application | Technology | Default Port | Purpose |
|---|---|---|---|
| `backend/` | Spring Boot 3.5.11 / Java 17 | `8081` | REST API & business logic |
| `frontend/` | React 19 / Vite 8 | `5173` (dev) | Student/staff user interface |
| `admin/` | React 19 / Vite | `5174` (dev) | Admin management interface |

---

## 2. Technology Stack

### Backend

| Component | Library / Version | Purpose |
|---|---|---|
| Framework | Spring Boot `3.5.11` | Web framework |
| Language | Java `17` | Language |
| Build Tool | Maven `3.x` | Build & dependency management |
| ORM | Spring Data JPA | Database abstraction |
| Database | PostgreSQL | Primary persistent store |
| Authentication | Spring Security + JWT (jjwt `0.13.0`) | Stateless auth |
| JWT Algorithm | HMAC-SHA256 (`HS256`) | Token signing |
| Password Hashing | BCrypt (Spring Security default) | Password storage |
| Email | Spring Mail + Thymeleaf HTML templates | Notification emails |
| Validation | Jakarta Validation (Bean Validation) | Input validation |
| Boilerplate | Lombok | Code generation |
| Testing | H2 in-memory DB + Spring Boot Test | Unit & integration tests |

### Frontend & Admin

| Component | Library / Version | Purpose |
|---|---|---|
| Framework | React `19.2.4` | UI framework |
| Build Tool | Vite `8.0.1` | Dev server & bundler |
| Routing | React Router `7.15.0` | Client-side routing |
| HTTP | Native Fetch API | Backend communication |
| Icons | lucide-react `1.20.0` | Icon set |
| Styling | CSS Modules / plain CSS | Component styling |
| Session Storage | `localStorage` | Persisting JWT & user data |

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├──────────────────────────┬──────────────────────────────────────┤
│   User Frontend (React)  │   Admin Frontend (React)             │
│   Port 5173              │   Port 5174                          │
│                          │                                      │
│  - Browse Items          │  - Claims Queue                      │
│  - Post Lost/Found       │  - Analytics Dashboard               │
│  - Match Results         │  - Audit Logs                        │
│  - Claim Items           │  - User Management                   │
│  - Notifications         │                                      │
│  - Rewards               │                                      │
└──────────────────────────┴──────────────────────────────────────┘
                           │
              HTTP REST (JSON) + Bearer JWT
                           │
┌─────────────────────────────────────────────────────────────────┐
│              Spring Boot Backend  (Port 8081)                    │
├─────────────────────────────────────────────────────────────────┤
│  JwtAuthenticationFilter  →  SecurityFilterChain                 │
├─────────────────────────────────────────────────────────────────┤
│  Controllers (REST)                                              │
│  AuthController | ItemController | MatchController               │
│  NotificationController | RewardController | EventController     │
│  AdminClaimController | AdminAnalyticsController                 │
│  AdminAuditController | UserController | SupportController       │
├─────────────────────────────────────────────────────────────────┤
│  Services (Business Logic)                                       │
│  AuthService | ItemService | ClaimService | NotificationService  │
│  RewardService | UserService | AuditLogService                   │
│  AdminAnalyticsService | MatchingEngine                          │
├─────────────────────────────────────────────────────────────────┤
│  Event System (Spring ApplicationEvent)                          │
│  ItemMatchedEvent | FoundItemSubmittedEvent | ItemClaimedEvent   │
│  NotificationEventListener (async consumer)                      │
├─────────────────────────────────────────────────────────────────┤
│  Repositories (Spring Data JPA)                                  │
│  UserRepository | ItemRepository | ItemMatchRepository           │
│  ClaimRepository | NotificationRepository | RewardLedgerRepo     │
│  AuditLogRepository | PickupScheduleRepository                   │
├─────────────────────────────────────────────────────────────────┤
│  Email (Spring Mail + Thymeleaf)                                 │
│  EmailService — item-match / reward-earned / generic templates   │
└─────────────────────────────────────────────────────────────────┘
                           │
                      JDBC / JPA
                           │
┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                            │
│  users | items | item_images | item_matches | claims             │
│  pickup_schedules | evidence_requests | notifications             │
│  reward_ledger | audit_logs                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Backend — Project Structure

**Base package:** `uom.msd.lostfound`

```
backend/src/main/java/uom/msd/lostfound/
│
├── LostfoundApplication.java          # Main Spring Boot entry point
│
├── auth/                              # JWT infrastructure
│   ├── AuthenticatedUser.java         # Spring Security principal
│   ├── JwtUtil.java                   # Token generation & validation
│   ├── JwtAuthenticationFilter.java   # Per-request JWT filter
│   └── RestAuthenticationEntryPoint.java
│
├── config/                            # Spring configuration
│   ├── SecurityConfig.java            # SecurityFilterChain definition
│   ├── CorsConfig.java                # CORS configuration
│   ├── PasswordConfig.java            # BCrypt PasswordEncoder bean
│   ├── WebConfig.java                 # Web MVC config
│   └── DataSeeder.java                # Dev-mode data seeding
│
├── controllers/                       # REST controllers
│   ├── AuthController.java            # /auth/**
│   ├── ItemController.java            # /items/**
│   ├── MatchController.java           # /matches/**
│   ├── NotificationController.java    # /api/notifications/**
│   ├── RewardController.java          # /api/rewards/**
│   ├── EventController.java           # /api/events/**
│   ├── UserController.java            # /users/**
│   ├── SupportController.java         # /support
│   ├── AdminClaimController.java      # /admin/claims/**
│   ├── AdminAnalyticsController.java  # /admin/analytics/**
│   └── AdminAuditController.java      # /admin/audit-log/**
│
├── services/                          # Business logic
│   ├── AuthService.java
│   ├── ItemService.java               (interface)
│   ├── ItemServiceImpl.java
│   ├── ClaimService.java              (interface)
│   ├── ClaimServiceImpl.java
│   ├── NotificationService.java
│   ├── RewardService.java
│   ├── UserService.java
│   ├── AuditLogService.java           (interface)
│   ├── AuditLogServiceImpl.java
│   ├── AdminAnalyticsService.java     (interface)
│   └── AdminAnalyticsServiceImpl.java
│
├── matching/
│   └── MatchingEngine.java            # Jaccard similarity matching algorithm
│
├── models/                            # JPA entities
│   ├── User.java
│   ├── Item.java
│   ├── ItemImage.java
│   ├── ItemMatch.java
│   ├── Claim.java
│   ├── EvidenceRequest.java
│   ├── PickupSchedule.java
│   ├── Notification.java
│   ├── RewardLedgerEntry.java
│   └── AuditLog.java
│
├── dto/                               # Request/Response DTOs
│   ├── AuthResponse.java
│   ├── RegisterRequest.java
│   ├── LoginRequest.java
│   ├── UserResponse.java
│   ├── UpdateProfileRequest.java
│   ├── ItemRequestDTO.java
│   ├── ItemResponseDTO.java
│   ├── MatchResponseDTO.java
│   ├── RunMatchingRequest.java
│   ├── ClaimResponseDTO.java
│   ├── ClaimListResponseDTO.java
│   ├── PickupScheduleDTO.java
│   ├── RejectClaimRequest.java
│   ├── RequestEvidenceDTO.java
│   ├── SendNotificationRequest.java
│   ├── NotificationResponse.java
│   ├── RewardTransactionRequest.java
│   ├── RewardBalanceResponse.java
│   ├── RewardLedgerEntryResponse.java
│   ├── AnalyticsResponseDTO.java
│   ├── AuditLogResponseDTO.java
│   ├── SupportRequest.java
│   ├── ForgotPasswordRequest.java
│   ├── ResetPasswordRequest.java
│   └── ApiErrorResponse.java
│
├── enums/
│   ├── Role.java
│   ├── ReportType.java
│   ├── ItemStatus.java
│   ├── MatchStatus.java
│   ├── ClaimStatus.java
│   ├── EvidenceStatus.java
│   ├── NotificationType.java
│   ├── NotificationChannel.java
│   ├── RewardTransactionType.java
│   └── AuditAction.java
│
├── events/
│   ├── ItemMatchedEvent.java
│   ├── ItemCreatedEvent.java
│   ├── FoundItemSubmittedEvent.java
│   ├── ItemClaimedEvent.java
│   └── NotificationEventListener.java
│
├── emails/
│   └── EmailService.java
│
├── repositories/
│   ├── UserRepository.java
│   ├── ItemRepository.java
│   ├── ItemMatchRepository.java
│   ├── ClaimRepository.java
│   ├── EvidenceRequestRepository.java
│   ├── PickupScheduleRepository.java
│   ├── NotificationRepository.java
│   ├── RewardLedgerRepository.java
│   └── AuditLogRepository.java
│
└── exceptions/
    ├── ResourceNotFoundException.java
    ├── DuplicateUsernameException.java
    ├── ClaimNotFoundException.java
    ├── InvalidClaimStatusTransitionException.java
    └── GlobalExceptionHandler.java
```

---

## 5. Database Entities (Models)

All entities use `@GeneratedValue(strategy = GenerationType.IDENTITY)` with `Long` primary keys.

---

### 5.1 `User` — Table: `users`

```java
@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(length = 255)
    private String email;

    @Column(nullable = false) @JsonIgnore
    private String passwordHash;          // BCrypt hash

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Role role;                    // USER | ADMIN  (default: USER)

    @Column(nullable = false)
    private LocalDateTime createdAt;      // set by @PrePersist

    // Optional profile fields
    private String fullName;              // length 100
    private String phone;                 // length 20
    private String studentId;            // length 20
    private String faculty;              // length 100
    private String department;           // length 100
    private String yearOfStudy;          // length 50
    private String profileImageUrl;      // length 255

    // Password reset
    private String resetToken;           // UUID, length 255
    private LocalDateTime resetTokenExpiry;  // expires in 1 hour
}
```

---

### 5.2 `Item` — Table: `items`

Database indexes: `idx_report_type`, `idx_status`, `idx_user_id`, `idx_created_at`

```java
@Entity @Table(name = "items", indexes = { ... })
public class Item {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String category;

    @Column(length = 255)
    private String location;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private ReportType reportType;        // LOST | FOUND

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private ItemStatus status;            // default: OPEN

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;      // @PrePersist

    @Column(nullable = false)
    private LocalDateTime updatedAt;      // @PreUpdate

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemImage> images;

    @OneToMany(mappedBy = "lostItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemMatch> matchesAsLost;

    @OneToMany(mappedBy = "foundItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemMatch> matchesAsFound;
}
```

---

### 5.3 `ItemImage` — Table: `item_images`

```java
@Entity @Table(name = "item_images")
public class ItemImage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false, length = 500)
    private String imageUrl;
}
```

---

### 5.4 `ItemMatch` — Table: `item_matches`

Unique constraint: `(lost_item_id, found_item_id)`  
Indexes: `idx_match_status`, `idx_confidence_score`, `idx_match_created_at`

```java
@Entity @Table(name = "item_matches", uniqueConstraints = {
    @UniqueConstraint(name = "uk_item_match", columnNames = {"lost_item_id", "found_item_id"})
})
public class ItemMatch {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lost_item_id", nullable = false)
    private Item lostItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "found_item_id", nullable = false)
    private Item foundItem;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal confidenceScore;   // 0.00 – 1.00

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private MatchStatus status;           // default: SUGGESTED

    private LocalDateTime createdAt;      // @PrePersist
    private LocalDateTime updatedAt;      // @PreUpdate
}
```

---

### 5.5 `Claim` — Table: `claims`

Unique constraint: `item_match_id` (one claim per match)  
Indexes: `idx_claims_status`, `idx_claims_claimant_id`, `idx_claims_requested_at`, `idx_claims_status_and_created_at`

```java
@Entity @Table(name = "claims", uniqueConstraints = {
    @UniqueConstraint(name = "uk_claim_item_match", columnNames = "item_match_id")
})
public class Claim {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_match_id", nullable = false, unique = true)
    private ItemMatch itemMatch;          // claim is tied to a match pair

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claimant_id", nullable = false)
    private User claimant;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private ClaimStatus status;           // default: PENDING

    @Column(columnDefinition = "TEXT")
    private String evidence;

    @Column(nullable = false, updatable = false)
    private LocalDateTime requestedAt;    // @PrePersist

    @Column(nullable = false)
    private LocalDateTime updatedAt;      // @PreUpdate
}
```

---

### 5.6 `Notification` — Table: `notifications`

Uses Lombok `@Builder`, `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`

```java
@Entity @Table(name = "notifications")
@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean read;                 // set false by @PrePersist

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private NotificationChannel channel;

    private Long referenceItemId;         // optional link to item

    @Column(nullable = false)
    private LocalDateTime createdAt;      // @PrePersist

    private LocalDateTime readAt;
}
```

---

### 5.7 `RewardLedgerEntry` — Table: `reward_ledger`

Uses Lombok `@Builder`

```java
@Entity @Table(name = "reward_ledger")
@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RewardLedgerEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private int points;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private RewardTransactionType transactionType;  // CREDIT | DEBIT

    @Column(nullable = false, length = 255)
    private String description;

    private Long referenceId;             // optional link to item/event

    @Column(nullable = false)
    private LocalDateTime createdAt;      // @PrePersist
}
```

---

### 5.8 `AuditLog` — Table: `audit_logs`

Indexes: `idx_audit_logs_action`, `idx_audit_logs_admin_id`, `idx_audit_logs_timestamp`, `idx_audit_logs_entity`, `idx_audit_logs_admin_and_timestamp`

```java
@Entity @Table(name = "audit_logs", indexes = { ... })
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private AuditAction action;

    @Column(nullable = false, length = 100)
    private String entityType;            // e.g. "Claim"

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false, length = 50)
    private String outcome;               // e.g. "SUCCESS"

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;      // @PrePersist
}
```

---

## 6. Enumerations

### `Role`
```java
USER, ADMIN
```

### `ReportType`
```java
LOST, FOUND
```

### `ItemStatus`
```java
OPEN,
MATCHED,
CLAIMED,
PENDING_REVIEW,
AWAITING_PICKUP,
SCHEDULED_FOR_AUCTION,
SCHEDULED_FOR_DONATION,
CLOSED
```

### `MatchStatus`
```java
SUGGESTED,        // confidence >= 0.70 (configurable)
PENDING_REVIEW,   // confidence >= 0.45 and < 0.70 (configurable)
ACCEPTED,         // confirmed by user or admin
REJECTED
```

### `ClaimStatus` (full lifecycle)
```java
PENDING,          // submitted, not yet reviewed
APPROVED,         // admin approved, awaiting pickup scheduling
REJECTED,         // admin rejected
AWAITING_PICKUP,  // scheduled pickup set
HANDED_OVER,      // item physically handed over
CLOSED            // fully resolved
```

### `NotificationType`
```java
ITEM_MATCH,       // @JsonAlias("ITEM_MATCHED") — match found
ITEM_CLAIMED,     // item was claimed
ITEM_RETURNED,    // item returned to owner
REWARD_EARNED,    // reward points credited
REWARD_REDEEMED,  // reward points debited
GENERAL           // general campus announcement
```

### `NotificationChannel`
```java
IN_APP, EMAIL, BOTH
```

### `RewardTransactionType`
```java
CREDIT, DEBIT
```

### `AuditAction`
```java
APPROVE_CLAIM,
REJECT_CLAIM,
REQUEST_EVIDENCE,
SCHEDULE_PICKUP,
CONFIRM_HANDOVER,
CLOSE_CLAIM
```

---

## 7. Data Transfer Objects (DTOs)

### Request DTOs

#### `RegisterRequest`
| Field | Type | Constraint |
|---|---|---|
| `username` | String | `@NotBlank` |
| `password` | String | `@NotBlank` |
| `email` | String | optional |

#### `LoginRequest`
| Field | Type | Constraint |
|---|---|---|
| `username` | String | `@NotBlank` |
| `password` | String | `@NotBlank` |

#### `ItemRequestDTO`
| Field | Type | Notes |
|---|---|---|
| `title` | String | required |
| `description` | String | optional |
| `category` | String | optional |
| `location` | String | optional |
| `reportType` | `ReportType` | `LOST` or `FOUND` |
| `imageUrls` | `List<String>` | defaults to empty list |

#### `SendNotificationRequest`
| Field | Type | Constraint |
|---|---|---|
| `userId` | Long | `@NotNull` |
| `type` | `NotificationType` | `@NotNull` |
| `title` | String | `@NotBlank` |
| `message` | String | `@NotBlank` |
| `channel` | `NotificationChannel` | `@NotNull` |
| `referenceItemId` | Long | optional |
| `recipientEmail` | String | required when channel is `EMAIL` or `BOTH` |

#### `RewardTransactionRequest`
| Field | Type | Constraint |
|---|---|---|
| `userId` | Long | `@NotNull` |
| `points` | int | `@Min(1)` |
| `transactionType` | `RewardTransactionType` | `@NotNull` |
| `description` | String | `@NotBlank` |
| `referenceId` | Long | optional |

#### `UpdateProfileRequest`
| Field | Type |
|---|---|
| `fullName` | String |
| `phone` | String |
| `studentId` | String |
| `faculty` | String |
| `department` | String |
| `yearOfStudy` | String |

### Response DTOs

#### `AuthResponse`
```json
{
  "accessToken": "eyJhbGci...",
  "tokenType": "Bearer",
  "user": { ...UserResponse }
}
```

#### `UserResponse`
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@university.edu",
  "role": "USER",
  "createdAt": "2024-01-15T10:00:00",
  "fullName": "John Doe",
  "phone": "+94771234567",
  "studentId": "S12345",
  "faculty": "Engineering",
  "department": "Computer Science",
  "yearOfStudy": "3rd Year",
  "profileImageUrl": "https://..."
}
```

#### `ItemResponseDTO`
```json
{
  "id": 42,
  "title": "Blue Backpack",
  "description": "Nike backpack with laptop",
  "category": "Bags",
  "location": "Library 2nd Floor",
  "reportType": "LOST",
  "status": "OPEN",
  "userId": 1,
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T10:00:00",
  "imageUrls": ["https://..."]
}
```

#### `MatchResponseDTO`
```json
{
  "id": 7,
  "lostItem": { ...ItemResponseDTO },
  "foundItem": { ...ItemResponseDTO },
  "confidenceScore": 0.82,
  "status": "SUGGESTED",
  "createdAt": "2024-01-15T11:00:00",
  "updatedAt": "2024-01-15T11:00:00"
}
```

#### `NotificationResponse`
```json
{
  "id": 5,
  "userId": 1,
  "type": "ITEM_MATCH",
  "title": "Possible Match Found: Blue Backpack",
  "message": "A possible match was found...",
  "read": false,
  "channel": "IN_APP",
  "referenceItemId": 42,
  "createdAt": "2024-01-15T11:05:00",
  "readAt": null
}
```

#### `ClaimListResponseDTO`
```json
{
  "claims": [ ...ClaimResponseDTO[] ],
  "totalCount": 25,
  "page": 0,
  "size": 20,
  "totalPages": 2,
  "hasNext": true,
  "hasPrevious": false
}
```

#### `AnalyticsResponseDTO`
```json
{
  "summary": {
    "totalClaims": 100,
    "approvedClaims": 40,
    "rejectedClaims": 15,
    "pendingClaims": 30,
    ...
  },
  "trendSeries": [ { "date": "2024-01-15", "count": 5 } ],
  "statusBreakdown": [ { "status": "PENDING", "count": 30 } ],
  "categoryBreakdown": [ { "category": "Electronics", "count": 20 } ],
  "locationBreakdown": [ { "location": "Library", "count": 12 } ]
}
```

#### `ApiErrorResponse` (error format)
```json
{
  "status": 400,
  "message": "Validation failed",
  "details": ["username: must not be blank"]
}
```

---

## 8. Repositories (Data Access Layer)

All repositories extend `JpaRepository<Entity, Long>`.

### `UserRepository`
```java
Optional<User> findByUsername(String username);
boolean existsByUsername(String username);
Optional<User> findByEmail(String email);
Optional<User> findByResetToken(String resetToken);
```

### `ItemRepository`
```java
List<Item> findByReportType(ReportType reportType);
List<Item> findByStatus(ItemStatus status);
List<Item> findByUserId(Long userId);
List<Item> findByReportTypeAndStatus(ReportType reportType, ItemStatus status);
List<Item> findByUserIdAndReportType(Long userId, ReportType reportType);

@Query("SELECT i FROM Item i WHERE LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR ...")
List<Item> searchByKeyword(@Param("keyword") String keyword);

@Query("SELECT i FROM Item i WHERE i.category = :category AND i.reportType = :type")
List<Item> findBysCategoryAndType(...);

@Query("SELECT i FROM Item i WHERE i.location = :location AND i.status = :status")
List<Item> findByLocationAndStatus(...);
```

### `ItemMatchRepository`
```java
List<ItemMatch> findByLostItemId(Long lostItemId);
List<ItemMatch> findByFoundItemId(Long foundItemId);
List<ItemMatch> findByStatus(MatchStatus status);
Optional<ItemMatch> findByLostItemIdAndFoundItemId(Long lostItemId, Long foundItemId);

@Query("SELECT im FROM ItemMatch im WHERE im.lostItem.id = :itemId OR im.foundItem.id = :itemId")
List<ItemMatch> findMatchesByItemId(@Param("itemId") Long itemId);

@Query("SELECT im FROM ItemMatch im WHERE im.lostItem.user.id = :userId OR im.foundItem.user.id = :userId")
List<ItemMatch> findMatchesVisibleToUser(@Param("userId") Long userId);

@Query("SELECT im FROM ItemMatch im WHERE im.status = :status AND im.confidenceScore >= :minScore ORDER BY im.confidenceScore DESC")
List<ItemMatch> findByStatusAndMinConfidenceScore(...);

@Query("SELECT COUNT(im) FROM ItemMatch im WHERE im.lostItem.id = :itemId AND im.status = :status")
long countByLostItemIdAndStatus(...);
```

### `ClaimRepository`
```java
List<Claim> findByStatus(ClaimStatus status);
List<Claim> findByClaimantId(Long claimantId);
Optional<Claim> findByItemMatchId(Long itemMatchId);

@Query("SELECT c FROM Claim c WHERE c.status = :status AND c.requestedAt BETWEEN :from AND :to")
List<Claim> findByStatusAndCreatedAtBetween(...);

@Query("SELECT c FROM Claim c WHERE c.requestedAt BETWEEN :from AND :to")
List<Claim> findByCreatedAtBetween(...);

Long countByStatus(ClaimStatus status);

@Query("SELECT c FROM Claim c ORDER BY c.requestedAt DESC")
List<Claim> findAllOrderByRequestedAtDesc();
```

### `NotificationRepository`
```java
List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);
long countByUserIdAndReadFalse(Long userId);
```

---

## 9. Services (Business Logic Layer)

### `AuthService`

| Method | Description |
|---|---|
| `register(RegisterRequest)` | Validates uniqueness of username, BCrypt-hashes password, saves `User`, returns JWT `AuthResponse` |
| `login(LoginRequest)` | Finds user by username, verifies BCrypt password, returns JWT `AuthResponse` |
| `getCurrentUser(Long userId)` | Loads user by ID, returns `UserResponse` |
| `findUserById(Long userId)` | Returns `User` entity or throws `ResourceNotFoundException` |
| `forgotPassword(String email)` | Generates UUID reset token, sets 1-hour expiry, returns token |
| `resetPassword(String token, String newPassword)` | Validates token + expiry, hashes new password, clears token |
| `changePassword(Long userId, String current, String newPwd)` | Verifies current password, hashes new password |

### `ItemService` (interface + `ItemServiceImpl`)

| Method | Description |
|---|---|
| `createItem(Long userId, ItemRequestDTO)` | Creates `Item` with initial status `OPEN`, saves `ItemImage` records |
| `getItemById(Long itemId)` | Returns `ItemResponseDTO` or throws `ResourceNotFoundException` |
| `getAllItems()` | Returns all items |
| `getItemsByType(ReportType)` | Filtered by `LOST` or `FOUND` |
| `getItemsByStatus(ItemStatus)` | Filtered by status |
| `getUserItems(Long userId)` | Items by user |
| `getItemsByTypeAndStatus(ReportType, ItemStatus)` | Combined filter |
| `searchItems(String)` | Full-text keyword search across title, description, category, location |
| `getItemsByCategory(String, ReportType)` | Filtered by category + type |
| `getItemsByLocation(String, ItemStatus)` | Filtered by location + status |
| `updateItemStatus(Long itemId, ItemStatus)` | Updates status |
| `deleteItem(Long itemId)` | Deletes item |
| `addImageToItem(Long itemId, String imageUrl)` | Adds `ItemImage` record |
| `getItemsWithPagination(int page, int size)` | Paginated list (max size: 50) |

### `ClaimService` (interface + `ClaimServiceImpl`)

| Method | Description |
|---|---|
| `getAllClaims(ClaimStatus, int page, int size)` | Returns claims with optional status filter and pagination |
| `getClaimById(Long claimId)` | Optional claim lookup |
| `getClaimsByClaimantId(Long)` | Claims by claimant |
| `createClaim(Long itemMatchId, Long claimantId)` | Creates `PENDING` claim tied to an `ItemMatch` |
| `approveClaim(Long claimId, Long adminId)` | Transitions `PENDING → APPROVED`, logs audit |
| `rejectClaim(Long claimId, String reason, Long adminId)` | Transitions to `REJECTED`, logs audit |
| `requestEvidence(Long claimId, String msg, Long adminId)` | Creates `EvidenceRequest`, logs audit |
| `schedulePickup(Long claimId, LocalDateTime, String loc, Long adminId)` | Creates `PickupSchedule`, transitions to `AWAITING_PICKUP` |
| `confirmHandover(Long claimId, Long adminId)` | Transitions to `HANDED_OVER`, logs audit |
| `closeClaim(Long claimId, Long adminId)` | Transitions to `CLOSED`, logs audit |

### `NotificationService`

| Method | Description |
|---|---|
| `sendNotification(SendNotificationRequest)` | Persists `Notification`; if channel `EMAIL`/`BOTH`, sends email via `EmailService` |
| `getNotificationsForUser(Long userId)` | Returns all notifications newest-first |
| `getUnreadNotificationsForUser(Long userId)` | Returns only unread notifications |
| `getUnreadCount(Long userId)` | Returns count of unread notifications |
| `markAsRead(Long notificationId, Long userId)` | Validates ownership, sets `read=true`, sets `readAt` |
| `markAllAsRead(Long userId)` | Marks all user notifications read |

### `RewardService`

| Method | Description |
|---|---|
| `recordTransaction(RewardTransactionRequest)` | Saves `RewardLedgerEntry` (CREDIT or DEBIT) |
| `getBalanceAndHistory(Long userId)` | Returns current balance + full transaction list |
| `getBalance(Long userId)` | Returns sum of all CREDIT minus DEBIT |

### `AuditLogService` (interface + `AuditLogServiceImpl`)

| Method | Description |
|---|---|
| `logAction(User admin, AuditAction, String entityType, Long entityId, String outcome, String notes)` | Saves `AuditLog` record |
| `getAuditLogs(AuditAction, Long adminId, String entityType, LocalDateTime from, LocalDateTime to)` | Returns filtered logs |
| `getEntityAuditHistory(String entityType, Long entityId)` | All audit events for one entity |
| `getAdminAuditHistory(Long adminId)` | All audit events by one admin |
| `getAllAuditLogs()` | All logs, newest first |

### `AdminAnalyticsService` (interface + `AdminAnalyticsServiceImpl`)

| Method | Description |
|---|---|
| `getClaimAnalytics(int range)` | Full `AnalyticsResponseDTO` for `range` days |
| `getSummary(int range)` | `SummaryDTO` only |
| `getTrendSeries(int range)` | Daily trend data points |
| `getStatusBreakdown(int range)` | Count per `ClaimStatus` |
| `getCategoryBreakdown(int range)` | Count per item category |
| `getLocationBreakdown(int range)` | Count per location |

---

## 10. REST API Endpoints — Controllers

**Base URL:** `http://localhost:8081`

> **Authentication:** All endpoints except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>`.  
> **Admin endpoints** (`/admin/**`) additionally require the `ROLE_ADMIN` role.

---

### 10.1 Auth Controller — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user |
| `POST` | `/auth/login` | Public | Login, returns JWT |
| `GET` | `/auth/me` | Bearer | Get current user profile |
| `POST` | `/auth/forgot-password` | Public | Generate password reset token |
| `POST` | `/auth/reset-password` | Public | Reset password using token |
| `POST` | `/auth/change-password` | Bearer | Change authenticated user's password |

**POST `/auth/register`**
```json
// Request
{ "username": "john_doe", "password": "pass123", "email": "john@uni.edu" }

// Response 201
{ "accessToken": "eyJ...", "tokenType": "Bearer", "user": { ...UserResponse } }
```

**POST `/auth/login`**
```json
// Request
{ "username": "john_doe", "password": "pass123" }

// Response 200
{ "accessToken": "eyJ...", "tokenType": "Bearer", "user": { ...UserResponse } }
```

**POST `/auth/forgot-password`**
```json
// Request
{ "email": "john@uni.edu" }

// Response 200
{ "message": "Reset link generated", "token": "<uuid>" }
```

**POST `/auth/reset-password`**
```json
// Request
{ "token": "<uuid>", "newPassword": "newpass123" }

// Response 200
{ "message": "Password has been reset successfully" }
```

**POST `/auth/change-password`**
```json
// Request
{ "currentPassword": "old", "newPassword": "new" }

// Response 200
{ "message": "Password changed successfully" }
```

---

### 10.2 User Controller — `/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| `PUT` | `/users/me` | Bearer | Update current user's profile fields |
| `POST` | `/users/me/photo` | Bearer | Upload profile photo (`multipart/form-data`, field: `file`) |
| `GET` | `/users/{userId}` | Bearer | Get user by ID |

---

### 10.3 Support Controller — `/support`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/support` | Bearer | Submit a support request (triggers email) |

```json
// Request
{ "subject": "Can't login", "message": "Getting 401 error..." }

// Response 200
{ "message": "Support request sent successfully" }
```

---

### 10.4 Item Controller — `/items`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/items` | Bearer | Create a new lost/found item |
| `GET` | `/items/{itemId}` | Public | Get item by ID |
| `GET` | `/items` | Public | Get all items |
| `GET` | `/items/type/{reportType}` | Public | Filter by `LOST` or `FOUND` |
| `GET` | `/items/status/{status}` | Public | Filter by `ItemStatus` |
| `GET` | `/items/user/{userId}` | Public | Get items posted by user |
| `GET` | `/items/filter?type=&status=` | Public | Filter by type + status |
| `GET` | `/items/search?q=` | Public | Full-text search |
| `GET` | `/items/category?category=&type=` | Public | Filter by category + type |
| `GET` | `/items/location?location=&status=` | Public | Filter by location + status |
| `PUT` | `/items/{itemId}/status?status=` | Bearer | Update item status |
| `POST` | `/items/{itemId}/images` | Bearer | Add image URL to item |
| `DELETE` | `/items/{itemId}` | Bearer | Delete item |
| `GET` | `/items/paginated?page=0&size=10` | Public | Paginated list (max size: 50) |

**POST `/items`**
```json
// Request
{
  "title": "Blue Nike Backpack",
  "description": "Found near library entrance",
  "category": "Bags",
  "location": "Library",
  "reportType": "FOUND",
  "imageUrls": ["https://storage/image1.jpg"]
}

// Response 201 — ItemResponseDTO
```

---

### 10.5 Match Controller — `/matches`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/matches/run?lostItemId=` | Bearer | Run matching for a single LOST item |
| `POST` | `/matches/run-filtered` | Bearer | Run matching for a list of LOST item IDs |
| `GET` | `/matches/my` | Bearer | Get matches visible to authenticated user |
| `GET` | `/matches/review-queue` | Bearer | Get `PENDING_REVIEW` matches |
| `POST` | `/matches/review-queue/{matchId}/approve` | Bearer | Approve `PENDING_REVIEW` match → `SUGGESTED` |
| `POST` | `/matches/review-queue/{matchId}/reject` | Bearer | Reject `PENDING_REVIEW` match → `REJECTED` |
| `GET` | `/matches` | Bearer | Query matches (optional filters: `status`, `lostItemId`, `foundItemId`, `itemId`) |
| `GET` | `/matches/{matchId}` | Bearer | Get match by ID |
| `POST` | `/matches/{matchId}/confirm` | Bearer | Confirm match → `ACCEPTED`, items → `MATCHED` |
| `POST` | `/matches/{matchId}/reject` | Bearer | Reject match → `REJECTED` |

**POST `/matches/run-filtered`**
```json
// Request
{ "lostItemIds": [1, 2, 3] }

// Response 200 — MatchResponseDTO[]
```

---

### 10.6 Admin Claim Controller — `/admin/claims`

Requires `ROLE_ADMIN`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/claims?status=&page=0&size=20` | List all claims (paged, optional status filter) |
| `GET` | `/admin/claims/{claimId}` | Get claim by ID |
| `POST` | `/admin/claims/{claimId}/approve` | Approve claim → `APPROVED` |
| `POST` | `/admin/claims/{claimId}/reject` | Reject claim with reason |
| `POST` | `/admin/claims/{claimId}/request-evidence` | Request evidence from claimant |
| `POST` | `/admin/claims/{claimId}/pickup-schedule` | Schedule pickup |
| `POST` | `/admin/claims/{claimId}/confirm-handover` | Confirm item handover |

**POST `/admin/claims/{claimId}/reject`**
```json
// Request
{ "reason": "Insufficient proof of ownership" }
```

**POST `/admin/claims/{claimId}/request-evidence`**
```json
// Request
{ "message": "Please provide a photo of the item receipt" }
```

**POST `/admin/claims/{claimId}/pickup-schedule`**
```json
// Request
{ "pickupAt": "2024-02-01T14:00:00", "location": "Security Office, Block A" }
```

---

### 10.7 Admin Analytics Controller — `/admin/analytics`

Requires `ROLE_ADMIN`. All endpoints accept `?range=N` (days, default 7, max 365).

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/analytics` | Full analytics dashboard |
| `GET` | `/admin/analytics/summary` | Summary statistics only |
| `GET` | `/admin/analytics/trends` | Daily trend series |
| `GET` | `/admin/analytics/status-breakdown` | Count per claim status |
| `GET` | `/admin/analytics/category-breakdown` | Count per item category |
| `GET` | `/admin/analytics/location-breakdown` | Count per location |

---

### 10.8 Admin Audit Controller — `/admin/audit-log`

Requires `ROLE_ADMIN`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/audit-log` | Filter logs by `action`, `adminId`, `entityType`, `from`, `to`, `page`, `size` |
| `GET` | `/admin/audit-log/entity/{entityType}/{entityId}` | Audit history for a specific entity |
| `GET` | `/admin/audit-log/admin/{adminId}` | Audit history for a specific admin |
| `GET` | `/admin/audit-log/all?page=0&size=100` | All logs, newest first |

Date format for `from`/`to`: ISO 8601 (`2024-01-01T00:00:00`)

---

### 10.9 Notification Controller — `/api/notifications`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/notifications` | Send a notification (internal use) |
| `GET` | `/api/notifications/users/{userId}` | All notifications for user (newest first) |
| `GET` | `/api/notifications/users/{userId}/unread` | Unread notifications only |
| `GET` | `/api/notifications/users/{userId}/unread-count` | `{ "unreadCount": N }` |
| `PATCH` | `/api/notifications/{id}/read?userId=` | Mark single notification as read |
| `PATCH` | `/api/notifications/users/{userId}/read-all` | Mark all as read |

---

### 10.10 Reward Controller — `/api/rewards`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/rewards/transactions` | Record a CREDIT or DEBIT transaction |
| `GET` | `/api/rewards/users/{userId}` | Full reward history + current balance |
| `GET` | `/api/rewards/users/{userId}/balance` | `{ "balance": N }` |

---

### 10.11 Event Controller — `/api/events`

Integration point allowing other services to trigger internal Spring Application Events via HTTP (replaces a message broker).

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/events/item-matched` | Fire `ItemMatchedEvent` |
| `POST` | `/api/events/found-item-submitted` | Fire `FoundItemSubmittedEvent` |
| `POST` | `/api/events/item-claimed` | Fire `ItemClaimedEvent` |

**POST `/api/events/item-matched`**
```json
{
  "lostItemOwnerId": 1,
  "lostItemOwnerEmail": "alice@uni.edu",
  "lostItemName": "Blue Backpack",
  "foundItemOwnerId": 2,
  "foundItemOwnerEmail": "bob@uni.edu",
  "foundItemName": "Backpack found in library",
  "foundItemId": 42,
  "foundItemDescription": "Blue Nike backpack with laptop",
  "foundLocation": "Library 2nd Floor"
}
// Response 202 Accepted
```

---

## 11. Matching Engine

**Class:** `uom.msd.lostfound.matching.MatchingEngine`  
**Spring bean:** `@Service @Transactional`

### Algorithm Overview

The engine compares a LOST item against all FOUND items with status `OPEN` using a weighted **Jaccard similarity** model.

**Configurable thresholds** (set via `application.properties` / `.env`):

| Property | Default | Description |
|---|---|---|
| `app.matching.threshold.suggested` | `0.70` | Score ≥ this → `SUGGESTED` (notified automatically) |
| `app.matching.threshold.manual-review` | `0.45` | Score ≥ this but < suggested → `PENDING_REVIEW` |
| `app.matching.weights.text` | `0.50` | Weight for text (title + description) similarity |
| `app.matching.weights.category` | `0.30` | Weight for category match |
| `app.matching.weights.location` | `0.20` | Weight for location similarity |

### Similarity Calculation

```
overallScore = (textSimilarity × 0.50)
             + (categorySimilarity × 0.30)
             + (locationSimilarity × 0.20)
```

**Text similarity** — Jaccard on token sets:
```
Jaccard(A, B) = |A ∩ B| / |A ∪ B|
```
- Tokens are lowercased, non-alphanumeric characters stripped
- Stop words removed: `a, an, the, and, or, but, is, are, was, were, in, on, at, to, for, with, my, your, of, it, this, that, i, you, he, she`

**Category similarity:**
- Both null → `1.0`
- One null → `0.5`
- Case-insensitive exact match → `1.0`, else `0.0`

**Location similarity:** Jaccard on location string tokens (same tokenizer)

### Match Lifecycle

```
Score < 0.45 → ignored (no record created)
Score 0.45–0.69 → ItemMatch created with status PENDING_REVIEW
Score ≥ 0.70 → ItemMatch created with status SUGGESTED
                 → ItemMatchedEvent fired → notifications sent

Existing ACCEPTED or REJECTED matches are never overwritten.
```

### Key Methods

| Method | Description |
|---|---|
| `runForFilteredLostItem(Long lostItemId)` | Run matching for a single LOST item. Validates item exists and is `OPEN`/`PENDING_REVIEW`. Returns created/updated matches. |
| `runForFilteredLostItems(List<Long>)` | Runs `runForFilteredLostItem` for each ID in the list |
| `calculateSimilarity(Item, Item)` | Returns `BigDecimal` score (scale 2) |
| `notifyOnSuggestedMatch(ItemMatch)` | Publishes `ItemMatchedEvent` for both item owners |
| `upsertMatch(lostItem, foundItem, score, status)` | Creates new match or updates existing if not `ACCEPTED`/`REJECTED` |

---

## 12. Event System

The system uses **Spring's synchronous `ApplicationEvent` with `@Async` listeners** as an internal event bus. This decouples the matching engine and claim workflows from notification delivery.

```
Matching/Claim Service
      │
      ├─ eventPublisher.publishEvent(new ItemMatchedEvent(...))
      │
      └─ NotificationEventListener (@EventListener @Async)
             ├─ notificationService.sendNotification(...)  ← IN_APP
             ├─ notificationService.sendNotification(...)  ← BOTH (email + in-app)
             └─ rewardService.recordTransaction(...)
```

### Events

| Event Class | Published By | Purpose |
|---|---|---|
| `ItemMatchedEvent` | `MatchingEngine` | Notify both item owners of a new SUGGESTED match |
| `ItemCreatedEvent` | `ItemService` | Fired when a new item is posted |
| `FoundItemSubmittedEvent` | `EventController` (external trigger) | Notify finder + award points |
| `ItemClaimedEvent` | `EventController` (external trigger) | Notify owner + award points |

### `NotificationEventListener` Behaviour

**On `ItemMatchedEvent`:**
- Sends `IN_APP` notification to lost item owner
- Sends `BOTH` (email + in-app) notification to found item owner

**On `FoundItemSubmittedEvent`:**
- Sends `IN_APP` notification confirming submission
- Credits finder with `app.rewards.points-per-found-item` points (default: `50`)

**On `ItemClaimedEvent`:**
- Sends `IN_APP` notification to item owner
- Credits claimant with `app.rewards.points-per-claimed-item` points (default: `20`)

---

## 13. Email Service

**Class:** `uom.msd.lostfound.emails.EmailService`  
**Annotations:** `@Service @RequiredArgsConstructor @Slf4j`  
**All methods are `@Async`**

Uses **Spring `JavaMailSender`** with **Thymeleaf HTML templates**.

| Method | Template | Trigger |
|---|---|---|
| `sendItemMatchEmail(...)` | `email/item-match` | Match event — email to lost item owner |
| `sendRewardEarnedEmail(...)` | `email/reward-earned` | Reward credit event |
| `sendGenericEmail(...)` | `email/generic-notification` | Generic in-app notification with email channel |
| `sendSupportEmail(...)` | `email/generic-notification` | Support request submission |

**Configuration** (from `application.properties`):
```properties
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
app.notification.from-email=${NOTIFICATION_FROM_EMAIL:notifications@lostfound.edu}
```

---

## 14. Authentication & Security

### JWT Token Structure

**Algorithm:** HMAC-SHA256 (`HS256`)  
**Claims:**

| Claim | Value |
|---|---|
| `sub` (subject) | `String.valueOf(user.getId())` — the user's numeric ID |
| `username` | `user.getUsername()` |
| `role` | `user.getRole().name()` (`USER` or `ADMIN`) |
| `iat` | Issued at (milliseconds) |
| `exp` | Expiry = issued + `TOKEN_EXPIRATION_MS` |

**Default expiry:** `21600000` ms = **6 hours**

### `JwtUtil` Methods

| Method | Description |
|---|---|
| `generateToken(User)` | Builds and signs JWT |
| `extractUserId(String token)` | Parses subject as `Long` |
| `extractRole(String token)` | Parses role claim as `Role` enum |
| `isTokenValid(String token)` | Checks expiry and signature |

### `JwtAuthenticationFilter` (per-request filter)

```
Request arrives
  ↓
Check header: "Authorization: Bearer <token>"
  ↓ (missing or malformed → pass through unauthenticated)
Validate token via JwtUtil.isTokenValid()
  ↓ (invalid → pass through)
Extract userId, load User from AuthService
Build AuthenticatedUser principal with authorities from Role
Set SecurityContextHolder authentication
  ↓
Continue filter chain
```

### `SecurityConfig` — Access Rules

```java
.requestMatchers("/auth/register/**", "/auth/login/**").permitAll()
.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
.requestMatchers("/admin/**").hasRole("ADMIN")
.anyRequest().authenticated()
```

- CSRF is **disabled** (stateless REST API)
- Session management is **STATELESS**
- CORS is configured globally via `CorsConfig`

### `AuthenticatedUser` (Spring Security Principal)

```java
public class AuthenticatedUser implements UserDetails {
    private Long id;
    private String username;
    private String email;
    private Role role;
    // getAuthorities() returns ["ROLE_USER"] or ["ROLE_ADMIN"]
}
```

Controllers inject the principal with `@AuthenticationPrincipal AuthenticatedUser authenticatedUser`.

---

## 15. Exception Handling

**Class:** `GlobalExceptionHandler` (`@RestControllerAdvice`)

All exceptions are mapped to `ApiErrorResponse` (`{ status, message, details[] }`):

| Exception | HTTP Status |
|---|---|
| `MethodArgumentNotValidException` | `400 Bad Request` (with field-level details) |
| `DuplicateUsernameException` | `409 Conflict` |
| `BadCredentialsException` | `401 Unauthorized` |
| `ResourceNotFoundException` | `404 Not Found` |
| `IllegalArgumentException` | `400 Bad Request` |
| `IllegalStateException` | `400 Bad Request` |
| `SecurityException` | `403 Forbidden` |
| `AccessDeniedException` | `403 Forbidden` |
| `InvalidClaimStatusTransitionException` | `400 Bad Request` |
| `ClaimNotFoundException` | `404 Not Found` |
| `Exception` (fallback) | `500 Internal Server Error` |

---

## 16. Application Configuration

**File:** `src/main/resources/application.properties`

```properties
spring.application.name=lostfound

# Imports .env file if present
spring.config.import=optional:file:.env[.properties]

# Database — values from environment variables
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8081

# JWT
app.auth.jwt.secret=${TOKEN_SECRET_KEY}
app.auth.jwt.expiration-ms=${TOKEN_EXPIRATION_MS:21600000}

# Mail
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Notifications
app.notification.from-email=${NOTIFICATION_FROM_EMAIL:notifications@lostfound.edu}

# Rewards
app.rewards.points-per-found-item=${REWARDS_POINTS_PER_FOUND_ITEM:50}
app.rewards.points-per-claimed-item=${REWARDS_POINTS_PER_CLAIMED_ITEM:20}

# Matching thresholds (defaults used by MatchingEngine)
app.matching.threshold.suggested=0.70
app.matching.threshold.manual-review=0.45
app.matching.weights.text=0.50
app.matching.weights.category=0.30
app.matching.weights.location=0.20
```

### Required Environment Variables (`.env` file)

| Variable | Example | Description |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/lostfound` | PostgreSQL connection URL |
| `DB_USER` | `postgres` | Database username |
| `DB_PASSWORD` | `secret` | Database password |
| `TOKEN_SECRET_KEY` | 32+ char random string | JWT HMAC signing key |
| `TOKEN_EXPIRATION_MS` | `21600000` | JWT lifetime in milliseconds |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP host |
| `MAIL_PORT` | `587` | SMTP port |
| `MAIL_USERNAME` | `app@gmail.com` | SMTP username |
| `MAIL_PASSWORD` | `app-password` | SMTP password |
| `NOTIFICATION_FROM_EMAIL` | `notifications@lostfound.edu` | From address for emails |
| `REWARDS_POINTS_PER_FOUND_ITEM` | `50` | Points credited when found item submitted |
| `REWARDS_POINTS_PER_CLAIMED_ITEM` | `20` | Points credited when claim completed |

---

## 17. Frontend — Project Structure

**Base API URL (hardcoded):** `http://192.168.8.100:8081`

```
frontend/src/
│
├── main.jsx                 # React entry point (renders <App />)
├── App.jsx                  # Root component — routing + state management
├── App.css                  # Global styles
├── index.css                # CSS variables & reset
├── router-mock.jsx          # NavigationContext (custom router replacement)
│
├── api/                     # HTTP client modules
│   ├── client.js            # Fetch wrapper, JWT injection, session management
│   ├── auth.js              # Auth endpoints
│   ├── items.js             # Item CRUD + normalization
│   ├── matches.js           # Match endpoints
│   └── notifications.js     # Notification endpoints
│
├── components/              # Shared UI components
│   ├── Navbar.jsx           # Top navigation bar
│   ├── Sidebar.jsx          # Side navigation drawer
│   ├── PostFoundtForm.jsx   # Found item submission form
│   ├── PostLostForm.jsx     # Lost item submission form
│   ├── PostItem.jsx         # Item card (display)
│   └── PostList.jsx         # List of item cards
│
├── pages/                   # Full-page route components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Registration.jsx
│   ├── ForgotPassword.jsx
│   ├── ResetPassword.jsx
│   ├── BrowseItems.jsx
│   ├── About.jsx
│   ├── Contact.jsx
│   ├── Dashboard.jsx        # Authenticated user home
│   ├── MyReports.jsx        # User's own item reports
│   ├── MatchResults.jsx     # Matching results view
│   ├── ClaimItem.jsx        # Claim submission form
│   ├── ReturnItem.jsx       # Return item flow
│   ├── Chat.jsx             # Messaging (UI only)
│   ├── Rewards.jsx          # Reward points dashboard
│   ├── Profile.jsx          # Profile management
│   ├── Settings.jsx         # User settings
│   ├── HelpSupport.jsx      # Support request form
│   ├── Notifications.jsx    # Notifications list
│   ├── AdminDashboard.jsx   # Admin home
│   ├── AdminReports.jsx     # Admin item reports
│   ├── AdminUsers.jsx       # Admin user management
│   └── AdminAnalytics.jsx   # Admin analytics charts
│
└── assets/                  # Images, icons
```

---

## 18. Frontend API Integration Layer

### `client.js` — Core HTTP Wrapper

**`API_BASE_URL`:** `http://192.168.8.100:8081` (hardcoded)

**Session storage:** `localStorage` key `lost_found_user` — JSON object:
```json
{
  "id": 1,
  "username": "john_doe",
  "name": "john_doe",
  "email": "john@uni.edu",
  "role": "student",
  "fullName": "",
  "phone": "",
  "studentId": "",
  "faculty": "",
  "department": "",
  "yearOfStudy": "",
  "profileImageUrl": "",
  "accessToken": "eyJ...",
  "token": "eyJ..."
}
```

**Key functions:**

| Function | Description |
|---|---|
| `getSavedUser()` | Parse `lost_found_user` from localStorage, returns null if invalid |
| `saveUserSession(authResponse, fallback)` | Normalizes & saves user session; accepts `accessToken`, `token`, or `jwt` |
| `clearUserSession()` | Removes `lost_found_user` from localStorage |
| `getToken()` | Returns `user.accessToken \|\| user.token` |
| `apiRequest(path, options)` | Core fetch wrapper — auto-injects `Authorization: Bearer`, handles `FormData`, throws on non-2xx, redirects to `/login` on 401 (not for login path itself) |

**`apiRequest` behaviour:**
- `Content-Type: application/json` auto-set unless body is `FormData`
- `401` response → clears session + redirects to `/login` (unless path is `/auth/login`)
- `204` response → returns `null`
- Error response body parsed as JSON `{ message }` or `{ error }` or raw text

---

### `auth.js`

| Function | Endpoint | Description |
|---|---|---|
| `registerUser({ name, username, email, password })` | `POST /auth/register` | Registers and saves session |
| `loginUser({ identifier, email, username, password })` | `POST /auth/login` | Logs in and saves session; sets `role` to `admin` if identifier contains "admin" |
| `logoutUser()` | (local only) | Clears session |
| `getCurrentUserFromStorage()` | (local only) | Returns saved user from localStorage |
| `updateProfile(profileData)` | `PUT /users/me` | Updates profile + refreshes stored session |
| `uploadProfilePhoto(file)` | `POST /users/me/photo` | Sends as `FormData`, refreshes session |
| `requestPasswordReset(email)` | `POST /auth/forgot-password` | — |
| `confirmPasswordReset(token, newPassword)` | `POST /auth/reset-password` | — |
| `changePassword(currentPassword, newPassword)` | `POST /auth/change-password` | — |

---

### `items.js`

**`toFrontendItem(item)`** — Normalizes backend response to frontend shape:
- Maps `reportType` to lowercase `type`
- Maps `description` to `desc`
- Maps `location` to `venue`
- Extracts `date` from `createdAt`

**`toBackendItem(itemData, forcedType)`** — Prepares payload for `POST /items`:
- Normalizes `reportType` to uppercase `LOST`/`FOUND`
- Combines `color` and `time` into `description`
- Ensures `imageUrls` is an array

| Function | Endpoint | Description |
|---|---|---|
| `getAllItems()` / `getItems()` | `GET /items` | All items, mapped to frontend shape |
| `getItemById(id)` | `GET /items/{id}` | Single item |
| `searchItems(searchTerm)` | `GET /items/search?q=` | Full-text search |
| `getItemsByType(type)` | `GET /items/filter?type=` | Filter by type |
| `getItemsByTypeAndStatus(type, status)` | `GET /items/filter?type=&status=` | Filter by type + status |
| `createItem(itemData, forcedType)` | `POST /items` | Create item with normalized payload |
| `deleteItem(id)` | `DELETE /items/{id}` | Delete item |

---

### `matches.js`

| Function | Endpoint | Description |
|---|---|---|
| `getMatches(filters)` | `GET /matches?...` | Get matches with optional query filters |
| `getMyMatches()` | `GET /matches/my` | Matches for authenticated user |
| `getMatchesForFoundItem(foundItemId)` | `GET /matches?foundItemId=` | Matches for a specific found item |
| `runMatchingForLostItem(lostItemId)` | `POST /matches/run?lostItemId=` | Run matching for one LOST item |
| `runMatchingForLostItems(ids[])` / `runMatchingForFilteredLostItems` | `POST /matches/run-filtered` | Run matching for multiple LOST items |
| `confirmMatch(matchId)` | `POST /matches/{id}/confirm` | Confirm match |
| `rejectMatch(matchId)` | `POST /matches/{id}/reject` | Reject match |
| `getReviewQueue()` | `GET /matches/review-queue` | Pending review matches |
| `approveReviewMatch(matchId)` | `POST /matches/review-queue/{id}/approve` | Approve pending review |
| `rejectReviewMatchReview(matchId)` | `POST /matches/review-queue/{id}/reject` | Reject pending review |

---

### `notifications.js`

| Function | Endpoint | Description |
|---|---|---|
| `getAllNotifications(userId)` | `GET /api/notifications/users/{userId}` | All notifications |
| `getUnreadNotifications(userId)` | `GET /api/notifications/users/{userId}/unread` | Unread only |
| `getUnreadCount(userId)` | `GET /api/notifications/users/{userId}/unread-count` | `{ unreadCount }` |
| `markNotificationAsRead(notifId, userId)` | `PATCH /api/notifications/{id}/read?userId=` | Mark one as read |
| `markAllNotificationsAsRead(userId)` | `PATCH /api/notifications/users/{userId}/read-all` | Mark all as read |
| `getCurrentUserId()` | (local only) | Returns `getSavedUser()?.id` |

---

## 19. Frontend Application Routing

The frontend uses a **custom `NavigationContext`** (defined in `router-mock.jsx`) rather than `react-router-dom`. The current page is tracked in React state and URL is updated via `window.history.pushState`.

### Route Map (`App.jsx` — `PAGES` constant)

| Route Key | Component | Auth Required | Roles |
|---|---|---|---|
| `home` | `Home` | No | guest, student, admin |
| `about` | `About` | No | guest, student, admin |
| `contact` | `Contact` | No | guest, student, admin |
| `login` | `Login` | No (guest only) | guest |
| `register` | `Registration` | No (guest only) | guest |
| `forgot` | `ForgotPassword` | No (guest only) | guest |
| `reset` / `reset-password` | `ResetPassword` | No (guest only) | guest |
| `browse` | `BrowseItems` | No | guest, student, admin |
| `dashboard` | `Dashboard` | Yes | student, admin |
| `postlost` | `PostLostForm` | Yes | student |
| `postfound` | `PostFoundForm` | Yes | student |
| `reports` | `MyReports` | Yes | student |
| `matchresults` | `MatchResults` | Yes | student |
| `claim` | `ClaimItem` | Yes | student |
| `return` | `ReturnItem` | Yes | student |
| `chat` | `Chat` | Yes | student |
| `rewards` | `Rewards` | Yes | student |
| `profile` | `Profile` | Yes | student, admin |
| `settings` | `Settings` | Yes | student, admin |
| `help-support` | `HelpSupport` | Yes | student, admin |
| `notifications` | `Notifications` | Yes | student, admin |
| `admin-dashboard` | `AdminDashboard` | Yes | admin |
| `admin-reports` | `AdminReports` | Yes | admin |
| `admin-users` | `AdminUsers` | Yes | admin |
| `admin-analytics` | `AdminAnalytics` | Yes | admin |

**Role mapping note:** The backend uses `Role.USER` / `Role.ADMIN`. The frontend maps these to `"student"` / `"admin"` strings locally. When `loginUser` is called, the identifier string is checked: if it contains `"admin"`, the session role is set to `"admin"`, otherwise `"student"`.

---

## 20. Admin Frontend

The `admin/` directory is a **separate Vite/React application** with its own `package.json` and `vite.config.js`.

### Admin App Structure

```
admin/src/
├── main.jsx
├── App.jsx
├── App.css
├── assets/
├── data/
│   └── mockAdminData.js     # Mock data for development/demo
├── services/
│   └── adminApi.js          # Admin-specific API calls
└── utils/
    └── formatters.js        # Date/number formatting utilities
```

The admin app communicates with the same backend. Admin routes start at `/admin/**`.

---

## 21. Data Flow Diagrams

### Authentication Flow
```
Frontend                  Backend
   │                         │
   ├─POST /auth/login ───────►│
   │  { username, password }  │
   │                         ├─ userRepository.findByUsername()
   │                         ├─ passwordEncoder.matches()
   │                         ├─ jwtUtil.generateToken(user)
   │◄─ { accessToken, user } ─┤
   │                         │
   ├─ saveUserSession() ──────│ (localStorage)
   │                         │
```

### Item Posting & Matching Flow
```
Frontend                  Backend                    Async
   │                         │                         │
   ├─POST /items ────────────►│                         │
   │  { title, reportType }  ├─ itemService.createItem()
   │                         ├─ itemRepository.save()   │
   │◄─ ItemResponseDTO ───────┤                         │
   │                         ├─ eventPublisher.publish(ItemCreatedEvent)
   │                         │                         │
   │                         │              ◄──────────┤ NotificationEventListener
   │                         │                         ├─ (optional) reward credits
   │                         │                         │
   │─POST /matches/run ──────►│                         │
   │  ?lostItemId=X          ├─ matchingEngine.run()   │
   │                         ├─ calculateSimilarity()  │
   │                         ├─ upsertMatch()          │
   │                         ├─ if SUGGESTED:          │
   │                         │   eventPublisher.publish(ItemMatchedEvent)
   │◄─ MatchResponseDTO[] ───┤                         │
   │                         │              ◄──────────┤ NotificationEventListener
   │                         │                         ├─ IN_APP notification (lost owner)
   │                         │                         └─ BOTH notification (found owner)
```

### Claim Lifecycle Flow
```
Student                  Admin                     Backend
   │                        │                         │
   ├─POST /admin/claims ─────────────────────────────►│
   │  (via ClaimService)    │                         ├─ createClaim()
   │                        │                         ├─ status: PENDING
   │                        │                         │
   │                       GET /admin/claims          │
   │                        ├───────────────────────►│
   │                        │◄─ claims list ──────────┤
   │                        │                         │
   │                       POST /admin/claims/{id}/approve
   │                        ├───────────────────────►│
   │                        │                         ├─ PENDING → APPROVED
   │                        │                         ├─ auditLogService.logAction()
   │                        │                         │
   │                       POST /admin/claims/{id}/pickup-schedule
   │                        ├───────────────────────►│
   │                        │                         ├─ APPROVED → AWAITING_PICKUP
   │                        │                         ├─ PickupSchedule saved
   │                        │                         │
   │                       POST /admin/claims/{id}/confirm-handover
   │                        ├───────────────────────►│
   │                        │                         ├─ AWAITING_PICKUP → HANDED_OVER
   │                        │                         ├─ auditLogService.logAction()
```

---

## 22. Development Setup

### Backend Setup

**Prerequisites:** Java 17+, Maven 3.8+, PostgreSQL 13+

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE lostfound;
   ```

2. Create a `.env` file in `backend/`:
   ```env
   DB_URL=jdbc:postgresql://localhost:5432/lostfound
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   TOKEN_SECRET_KEY=your-32-character-minimum-secret-key
   TOKEN_EXPIRATION_MS=21600000
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your@gmail.com
   MAIL_PASSWORD=your-app-password
   NOTIFICATION_FROM_EMAIL=notifications@lostfound.edu
   ```

3. Run the backend:
   ```bash
   cd backend
   mvn spring-boot:run
   # OR use the provided run.bat (Windows)
   ```

   The API starts on **port 8081**. Schema is auto-created by `spring.jpa.hibernate.ddl-auto=update`.

### Frontend Setup

**Prerequisites:** Node.js 18+, npm

1. Update `API_BASE_URL` in `frontend/src/api/client.js` to match the backend host.

2. Install dependencies and run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Dev server starts on **port 5173**.

### Admin Frontend Setup

```bash
cd admin
npm install
npm run dev
```
Dev server starts on **port 5174** (verify in `admin/vite.config.js`).

### Build for Production

```bash
# Backend JAR
cd backend && mvn package

# Frontend
cd frontend && npm run build   # outputs to dist/

# Admin
cd admin && npm run build      # outputs to dist/
```

---

*Documentation generated from source code at `backend/`, `frontend/`, and `admin/` directories.*
