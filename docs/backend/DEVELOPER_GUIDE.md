# Backend Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [Models & Entities](#models--entities)
6. [Services & Business Logic](#services--business-logic)
7. [Controllers & API Endpoints](#controllers--api-endpoints)
8. [Database Design](#database-design)
9. [Authentication & Authorization](#authentication--authorization)
10. [Development Setup](#development-setup)
11. [Running Tests](#running-tests)
12. [Building & Deployment](#building--deployment)

---

## Project Overview

The backend is built using **Spring Boot 3.x** and provides a RESTful API for the Lost & Found Management System. It handles:
- User authentication and management
- Item CRUD operations
- Intelligent matching algorithm
- Claim management and verification
- Notification system
- Admin operations and analytics
- Audit logging and security

---

## Technology Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| Spring Boot | 3.x | Web framework |
| Spring Data JPA | Latest | ORM & Data access |
| Spring Security | Latest | Authentication & Authorization |
| PostgreSQL | 13+ | Primary database |
| JWT (jjwt) | Latest | Token generation & validation |
| BCrypt | Spring Security | Password encoding |
| Maven | 3.8+ | Build tool |
| Java | 17+ | Language |
| JUnit 5 | Latest | Testing framework |

---

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── uom/
│   │       ├── config/
│   │       │   ├── JwtTokenProvider.java
│   │       │   ├── SecurityConfig.java
│   │       │   └── CorsConfig.java
│   │       │
│   │       ├── controller/
│   │       │   ├── AuthController.java
│   │       │   ├── ItemController.java
│   │       │   ├── MatchController.java
│   │       │   ├── ClaimController.java
│   │       │   ├── NotificationController.java
│   │       │   ├── RewardController.java
│   │       │   ├── UserController.java
│   │       │   ├── AdminController.java
│   │       │   ├── AuditController.java
│   │       │   ├── SettingsController.java
│   │       │   ├── EventController.java
│   │       │   └── InternalApiController.java
│   │       │
│   │       ├── service/
│   │       │   ├── AuthService.java
│   │       │   ├── ItemService.java
│   │       │   ├── MatchingService.java
│   │       │   ├── ClaimService.java
│   │       │   ├── NotificationService.java
│   │       │   ├── RewardService.java
│   │       │   ├── UserService.java
│   │       │   ├── AdminService.java
│   │       │   ├── AuditService.java
│   │       │   └── SettingsService.java
│   │       │
│   │       ├── repository/
│   │       │   ├── UserRepository.java
│   │       │   ├── ItemRepository.java
│   │       │   ├── ItemMatchRepository.java
│   │       │   ├── ClaimRepository.java
│   │       │   ├── NotificationRepository.java
│   │       │   ├── RewardLedgerRepository.java
│   │       │   ├── AuditLogRepository.java
│   │       │   ├── VerificationCodeRepository.java
│   │       │   ├── SettingsRepository.java
│   │       │   └── MessageRepository.java
│   │       │
│   │       ├── entity/
│   │       │   ├── User.java
│   │       │   ├── Item.java
│   │       │   ├── ItemMatch.java
│   │       │   ├── Claim.java
│   │       │   ├── Notification.java
│   │       │   ├── RewardLedgerEntry.java
│   │       │   ├── AuditLog.java
│   │       │   ├── VerificationCode.java
│   │       │   ├── Settings.java
│   │       │   ├── Message.java
│   │       │   └── Activity.java
│   │       │
│   │       ├── dto/
│   │       │   ├── request/
│   │       │   │   ├── RegisterRequest.java
│   │       │   │   ├── LoginRequest.java
│   │       │   │   ├── PostItemRequest.java
│   │       │   │   ├── UpdateItemRequest.java
│   │       │   │   ├── ClaimRequest.java
│   │       │   │   └── ... (other request DTOs)
│   │       │   │
│   │       │   └── response/
│   │       │       ├── AuthResponse.java
│   │       │       ├── UserResponse.java
│   │       │       ├── ItemResponse.java
│   │       │       ├── MatchResponse.java
│   │       │       └── ... (other response DTOs)
│   │       │
│   │       ├── enum/
│   │       │   ├── ItemStatus.java
│   │       │   ├── ItemType.java
│   │       │   ├── ClaimStatus.java
│   │       │   ├── MatchStatus.java
│   │       │   ├── NotificationType.java
│   │       │   ├── NotificationChannel.java
│   │       │   ├── UserRole.java
│   │       │   └── RewardType.java
│   │       │
│   │       ├── exception/
│   │       │   ├── ResourceNotFoundException.java
│   │       │   ├── UnauthorizedException.java
│   │       │   ├── BadRequestException.java
│   │       │   ├── ConflictException.java
│   │       │   └── GlobalExceptionHandler.java
│   │       │
│   │       ├── security/
│   │       │   ├── JwtAuthenticationFilter.java
│   │       │   ├── JwtTokenProvider.java
│   │       │   └── CustomUserDetailsService.java
│   │       │
│   │       ├── event/
│   │       │   ├── ItemPostedEvent.java
│   │       │   ├── ClaimCreatedEvent.java
│   │       │   ├── MatchFoundEvent.java
│   │       │   └── EventListener.java
│   │       │
│   │       ├── util/
│   │       │   ├── JwtUtils.java
│   │       │   ├── ValidationUtils.java
│   │       │   └── DateUtils.java
│   │       │
│   │       └── LostFoundApplication.java
│   │
│   └── resources/
│       ├── application.properties (or application.yml)
│       ├── application-dev.properties
│       ├── application-prod.properties
│       └── db/
│           └── migration/
│               ├── V1__Initial_Schema.sql
│               └── V2__Add_Indexes.sql
│
└── test/
    ├── java/
    │   └── uom/
    │       ├── controller/
    │       ├── service/
    │       ├── repository/
    │       └── integration/
    │
    └── resources/
        └── application-test.properties
```

---

## Core Components

### 1. **Controllers** (HTTP Request Handlers)

Controllers expose REST endpoints and handle incoming HTTP requests. Each controller is responsible for one domain.

**Key Controllers:**

| Controller | Base Path | Responsibility |
|-----------|-----------|-----------------|
| `AuthController` | `/auth` | User registration, login, password reset |
| `ItemController` | `/items` | CRUD operations for lost/found items |
| `MatchController` | `/matches` | Query matching results, manage matches |
| `ClaimController` | `/claims` | Create, update, and track claims |
| `NotificationController` | `/notifications` | Retrieve and manage in-app notifications |
| `UserController` | `/users` | User profile management |
| `AdminController` | `/admin` | Admin-specific operations |
| `AuditController` | `/audit` | Access audit logs |

**Example Controller:**
```java
@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class ItemController {
    
    private final ItemService itemService;
    private final JwtTokenProvider jwtTokenProvider;
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> postItem(
            @RequestBody PostItemRequest request,
            @RequestHeader("Authorization") String token) {
        String userId = jwtTokenProvider.getUserIdFromToken(token);
        Item item = itemService.createItem(request, userId);
        return ResponseEntity.status(201).body(new ItemResponse(item));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getItem(@PathVariable String id) {
        Item item = itemService.getItemById(id);
        return ResponseEntity.ok(new ItemResponse(item));
    }
}
```

### 2. **Services** (Business Logic Layer)

Services contain the core business logic and orchestrate repository calls.

**Key Services:**

| Service | Purpose |
|---------|---------|
| `AuthService` | User registration, validation, token generation |
| `ItemService` | Item CRUD, status management, image handling |
| `MatchingService` | Intelligent matching algorithm |
| `ClaimService` | Claim creation, approval, verification |
| `NotificationService` | In-app notification creation and delivery |
| `UserService` | User profile management, preferences |
| `AdminService` | Admin analytics, user management |
| `AuditService` | Audit log creation and retrieval |

**Example Service:**
```java
@Service
@RequiredArgsConstructor
public class ItemService {
    
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    
    public Item createItem(PostItemRequest request, String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Item item = Item.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .itemType(request.getItemType())
            .status(ItemStatus.ACTIVE)
            .poster(user)
            .build();
        
        Item saved = itemRepository.save(item);
        
        // Publish event for async processing
        eventPublisher.publishEvent(new ItemPostedEvent(saved));
        
        return saved;
    }
}
```

### 3. **Repositories** (Data Access Layer)

Repositories provide methods to interact with the database using Spring Data JPA.

**Key Features:**
- Automatic CRUD methods via `JpaRepository`
- Custom query methods with `@Query`
- Named queries for complex filtering
- Pagination and sorting support

**Example Repository:**
```java
@Repository
public interface ItemRepository extends JpaRepository<Item, String> {
    
    List<Item> findByItemType(ItemType itemType);
    
    List<Item> findByStatusAndItemType(ItemStatus status, ItemType itemType);
    
    @Query("SELECT i FROM Item i WHERE i.category = :category " +
           "AND i.status = 'ACTIVE' ORDER BY i.createdAt DESC")
    List<Item> findActiveItemsByCategory(@Param("category") String category);
    
    Page<Item> findByPoster(User poster, Pageable pageable);
}
```

---

## Models & Entities

### User
```java
@Entity
@Table(name = "users")
public class User {
    @Id private String id;
    private String username;
    private String email;
    private String passwordHash;
    private UserRole role; // USER, ADMIN
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean emailVerified;
    // ... getters, setters, relationships
}
```

### Item
```java
@Entity
@Table(name = "items")
public class Item {
    @Id private String id;
    private String title;
    private String description;
    private ItemType itemType; // LOST, FOUND
    private ItemStatus status; // ACTIVE, MATCHED, CLAIMED, RESOLVED
    @ManyToOne private User poster;
    private LocalDateTime createdAt;
    private LocalDateTime lostFoundDate;
    private String location;
    private String imageUrl;
    // ... relationships to matches, claims
}
```

### ItemMatch
```java
@Entity
@Table(name = "item_matches")
public class ItemMatch {
    @Id private String id;
    @ManyToOne private Item lostItem;
    @ManyToOne private Item foundItem;
    private MatchStatus status; // PENDING, ACCEPTED, REJECTED
    private Double matchScore;
    private LocalDateTime createdAt;
}
```

### Claim
```java
@Entity
@Table(name = "claims")
public class Claim {
    @Id private String id;
    @ManyToOne private Item item;
    @ManyToOne private User claimant;
    private ClaimStatus status; // PENDING, APPROVED, VERIFIED, COMPLETED
    private String evidence;
    private LocalDateTime createdAt;
    private LocalDateTime verifiedAt;
    private LocalDateTime pickupScheduledFor;
}
```

### Notification
```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id private String id;
    @ManyToOne private User recipient;
    private NotificationType type; // MATCH_FOUND, CLAIM_STATUS, REMINDER
    private NotificationChannel channel; // IN_APP, EMAIL, BOTH
    private String title;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
}
```

---

## Services & Business Logic

### AuthService
**Responsibilities:**
- User registration with email validation
- Password encryption with BCrypt
- JWT token generation (6-hour expiration)
- Password reset token management

**Key Methods:**
```java
public AuthResponse registerUser(RegisterRequest request)
public AuthResponse loginUser(LoginRequest request)
public boolean validateToken(String token)
public String generatePasswordResetToken(String email)
public void resetPassword(String token, String newPassword)
```

### MatchingService
**Responsibilities:**
- Algorithm for matching lost items with found items
- Similarity scoring based on category, location, date
- Automatic match creation
- Match notification to both parties

**Matching Algorithm:**
```
Score = (category_match * 0.4) + 
         (location_similarity * 0.3) + 
         (date_proximity * 0.2) +
         (description_similarity * 0.1)

If score >= 0.6, create ItemMatch with status PENDING
```

### ClaimService
**Responsibilities:**
- Claim creation and validation
- Evidence review workflow
- Verification code generation
- Claim status transitions

**Claim Workflow:**
```
PENDING → (admin review) → APPROVED → (user verification) → VERIFIED → COMPLETED
              ↓ (rejected)
          REJECTED
```

### NotificationService
**Responsibilities:**
- Notification creation and queuing
- Multi-channel delivery (IN_APP, EMAIL)
- Notification read status tracking
- Delivery retry logic

---

## Controllers & API Endpoints

### Authentication Endpoints

```
POST   /auth/register
Body: { username, password, email }
Response: { accessToken, tokenType, user }

POST   /auth/login
Body: { username, password }
Response: { accessToken, tokenType, user }

GET    /auth/me
Headers: Authorization: Bearer <token>
Response: { id, username, email, role, createdAt }

POST   /auth/forgot-password
Body: { email }
Response: { message, token }

POST   /auth/reset-password
Body: { token, newPassword }
Response: { message }

POST   /auth/change-password
Headers: Authorization: Bearer <token>
Body: { currentPassword, newPassword }
Response: { message }
```

### Item Endpoints

```
POST   /items
Headers: Authorization: Bearer <token>
Body: { title, description, itemType, location, image }
Response: { id, title, status, createdAt }

GET    /items
Query: ?type=LOST&status=ACTIVE&limit=20&offset=0
Response: [ { id, title, itemType, status, poster, createdAt }, ... ]

GET    /items/{id}
Response: { id, title, description, itemType, status, poster, createdAt }

PUT    /items/{id}
Headers: Authorization: Bearer <token>
Body: { title, description, location }
Response: { id, ...updated item }

DELETE /items/{id}
Headers: Authorization: Bearer <token>
Response: { message: "Item deleted" }

PUT    /items/{id}/status
Headers: Authorization: Bearer <token>
Body: { status: "CLAIMED" }
Response: { id, status, updatedAt }

GET    /items/{id}/matches
Response: [ { id, matchScore, otherItem, status }, ... ]
```

### Matching Endpoints

```
GET    /matches
Headers: Authorization: Bearer <token>
Query: ?status=PENDING&limit=20
Response: [ { id, lostItem, foundItem, matchScore, status }, ... ]

GET    /matches/{id}
Response: { id, lostItem, foundItem, matchScore, status, createdAt }

PUT    /matches/{id}/status
Headers: Authorization: Bearer <token>
Body: { status: "ACCEPTED" }
Response: { id, status, updatedAt }
```

### Claim Endpoints

```
POST   /items/{id}/claim
Headers: Authorization: Bearer <token>
Body: { evidence, contactPreference }
Response: { id, status, createdAt }

GET    /claims
Headers: Authorization: Bearer <token>
Response: [ { id, item, status, createdAt }, ... ]

GET    /claims/{id}
Headers: Authorization: Bearer <token>
Response: { id, item, claimant, status, evidence, createdAt }

PUT    /claims/{id}/status
Headers: Authorization: Bearer <token>
Body: { status: "APPROVED" }
Response: { id, status, updatedAt }

POST   /claims/{id}/verify
Headers: Authorization: Bearer <token>
Body: { verificationCode }
Response: { message, status }
```

### Notification Endpoints

```
GET    /notifications
Headers: Authorization: Bearer <token>
Query: ?unreadOnly=true&limit=20
Response: [ { id, type, title, message, isRead, createdAt }, ... ]

PUT    /notifications/{id}/read
Headers: Authorization: Bearer <token>
Response: { id, isRead, readAt }

PUT    /notifications/mark-all-read
Headers: Authorization: Bearer <token>
Response: { message }

GET    /notifications/unread-count
Headers: Authorization: Bearer <token>
Response: { unreadCount }
```

### Admin Endpoints

```
GET    /admin/claims
Headers: Authorization: Bearer <token> (must be ADMIN)
Query: ?status=PENDING&limit=20
Response: [ { id, item, claimant, status, evidence, createdAt }, ... ]

PUT    /admin/claims/{id}/approve
Body: { requiresVerification: true }
Response: { id, status, verificationCodeSent: true }

PUT    /admin/claims/{id}/reject
Body: { reason }
Response: { id, status, rejectionReason }

GET    /admin/analytics
Response: { totalItems, totalMatches, totalClaims, activeClaims, ... }

GET    /admin/audit-logs
Query: ?action=CLAIM_CREATED&limit=50
Response: [ { id, action, userId, targetId, timestamp }, ... ]

GET    /admin/users
Query: ?limit=20&offset=0
Response: [ { id, username, email, role, createdAt, ... }, ... ]

PUT    /admin/users/{id}/role
Body: { role: "ADMIN" }
Response: { id, role, updatedAt }
```

---

## Database Design

### Schema Overview

**Core Tables:**
- `users` - User accounts
- `items` - Lost and found items
- `item_matches` - Matching results
- `claims` - Claim records
- `notifications` - User notifications
- `reward_ledger_entries` - Reward points tracking
- `audit_logs` - System audit trail
- `verification_codes` - Claim verification codes
- `settings` - User preferences
- `messages` - Chat/messaging between users
- `activity` - User activity tracking

### Key Relationships

```
User (1) ──→ (Many) Item
User (1) ──→ (Many) Claim (as claimant)
User (1) ──→ (Many) Notification
User (1) ──→ (Many) RewardLedgerEntry

Item (1) ──→ (Many) ItemMatch
Item (1) ──→ (Many) Claim

Claim (1) ──→ (Many) VerificationCode
```

### Indexing Strategy

Key indexes for performance:
- `idx_items_user_id` - User's items
- `idx_items_status` - Active items filtering
- `idx_items_type` - Filter by item type
- `idx_items_created_at` - Recency sorting
- `idx_claims_status` - Pending claims
- `idx_notifications_user_read` - Unread notifications
- `idx_audit_logs_timestamp` - Audit trail
- `idx_matches_created_at` - Recent matches

---

## Authentication & Authorization

### JWT Token Structure

```
Header: { alg: "HS512", typ: "JWT" }

Payload: {
  sub: "user_id",
  username: "john_doe",
  email: "john@example.com",
  role: "USER",
  iat: 1234567890,
  exp: 1234571490  // 6 hours later
}

Signature: HMACSHA512(
  base64(Header) + "." + base64(Payload),
  secret_key
)
```

### Security Annotations

```java
// Requires authentication
@PreAuthorize("isAuthenticated()")

// Requires specific role
@PreAuthorize("hasRole('ADMIN')")

// Allows public access
@PermitAll

// No access
@DenyAll
```

---

## Development Setup

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- PostgreSQL 13+
- Git

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone <repo-url>
   cd Lost-Found-System/backend
   ```

2. **Configure Database**
   ```bash
   createdb lostfound
   # Update application.properties with DB credentials
   ```

3. **Set Environment Variables**
   ```bash
   export JWT_SECRET=your_secret_key_here
   export DB_URL=jdbc:postgresql://localhost:5432/lostfound
   export DB_USERNAME=postgres
   export DB_PASSWORD=your_password
   ```

4. **Build Project**
   ```bash
   mvn clean install
   ```

5. **Run Application**
   ```bash
   mvn spring-boot:run
   ```
   Server starts at `http://localhost:8085`

### Application Properties

```properties
# Server
server.port=8085
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/lostfound
spring.datasource.username=postgres
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# JWT
app.jwt.secret=your_secret_key_min_32_chars
app.jwt.expiration=21600000  # 6 hours in ms

# CORS
spring.web.cors.allowed-origins=http://localhost:5173,http://localhost:5174
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allow-credentials=true

# Logging
logging.level.root=INFO
logging.level.uom=DEBUG
```

---

## Running Tests

### Unit Tests
```bash
mvn test
```

### Integration Tests
```bash
mvn verify
```

### Test Coverage
```bash
mvn test jacoco:report
```

### Example Test
```java
@SpringBootTest
class ItemServiceTest {
    
    @MockBean
    private ItemRepository itemRepository;
    
    @InjectMocks
    private ItemService itemService;
    
    @Test
    void testCreateItem() {
        PostItemRequest request = new PostItemRequest(
            "Lost Wallet", "Black leather", ItemType.LOST, "Main St"
        );
        
        // Arrange
        User user = new User("user1", "test@email.com");
        Mockito.when(itemRepository.save(any())).thenReturn(new Item(...));
        
        // Act
        Item result = itemService.createItem(request, user.getId());
        
        // Assert
        assertNotNull(result);
        assertEquals("Lost Wallet", result.getTitle());
    }
}
```

---

## Building & Deployment

### Build JAR
```bash
mvn clean package -DskipTests
```

### Docker Deployment
```bash
docker build -t lostfound-backend:1.0 .
docker run -p 8085:8085 \
  -e DB_URL=jdbc:postgresql://db:5432/lostfound \
  -e JWT_SECRET=your_secret \
  lostfound-backend:1.0
```

### Production Considerations
- Use environment variables for sensitive data
- Enable HTTPS/TLS
- Configure database backups
- Set up monitoring and alerting
- Use a reverse proxy (Nginx)
- Enable rate limiting
- Configure CORS properly

---

## Best Practices

1. **Code Organization**: Keep DTOs separate from entities
2. **Error Handling**: Use custom exceptions with meaningful messages
3. **Transactions**: Use `@Transactional` for operations spanning multiple repositories
4. **Logging**: Log important operations and errors
5. **Validation**: Validate input in services, not just controllers
6. **Security**: Never log sensitive data
7. **Performance**: Use pagination for large result sets
8. **Testing**: Write tests for complex business logic

---

**Last Updated**: 2026-06-18
