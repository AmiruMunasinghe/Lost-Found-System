# Lost-Found-System: Comprehensive Workspace Exploration

**Generated**: 2026-06-18  
**Project**: University of Moratuwa Lost & Found Management System

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Structure](#frontend-structure)
4. [Admin Application](#admin-application)
5. [Database Structure](#database-structure)
6. [API Endpoints](#api-endpoints)
7. [Documentation Status](#documentation-status)

---

## Project Overview

### Purpose
Digitize and streamline the process of reporting, tracking, and recovering lost items on campus.

### Tech Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend** | Spring Boot | 3.5.11 |
| **Java** | OpenJDK | 17+ |
| **Frontend** | React | 19.2.4 |
| **Frontend Build** | Vite | 8.0.1 |
| **Database** | PostgreSQL | (specified in .env) |
| **Routing** | React Router | 7.15.0 |
| **Authentication** | JWT (Custom) | - |

### Key Features
- User authentication (JWT-based)
- Lost & found item management
- Automated matching engine with confidence scoring
- Multi-channel notification system (IN_APP, EMAIL, BOTH)
- Reward/points system
- Admin dashboard for content & user management
- Audit logging for compliance
- Pickup scheduling
- Evidence request management

---

## Backend Architecture

### Location
`backend/src/main/java/uom/msd/lostfound/`

### Core Packages

#### 1. **Models** (`models/`)
Core entity classes with JPA persistence annotations:

| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| **User** | System users (students/staff) | username, email, role, fullName, phone, studentId, faculty, department, yearOfStudy |
| **Item** | Lost/found item reports | title, description, category, location, reportType (LOST/FOUND), status, userId, createdAt |
| **ItemMatch** | Links lost & found items | lostItemId, foundItemId, confidenceScore (0.00-1.00), status |
| **ItemImage** | Image URLs for items | itemId, imageUrl, createdAt |
| **Claim** | User claims to match ownership | itemMatchId, claimantId, status, evidence, requestedAt |
| **EvidenceRequest** | Admin requests additional proof | claimId, details, status |
| **PickupSchedule** | Scheduled item handovers | claimId, scheduleDate, location |
| **Notification** | Multi-channel notifications | userId, type, title, message, channel, read, createdAt, readAt |
| **RewardLedgerEntry** | Points transactions | userId, points, transactionType (CREDIT/DEBIT), referenceId |
| **AuditLog** | Admin action logs | adminId, action, entityType, entityId, outcome, timestamp |

#### 2. **Enums** (`enums/`)
Status and type definitions:

| Enum | Values |
|------|--------|
| **ItemStatus** | OPEN, MATCHED, CLAIMED, PENDING_REVIEW, AWAITING_PICKUP, SCHEDULED_FOR_AUCTION, SCHEDULED_FOR_DONATION, CLOSED |
| **ReportType** | LOST, FOUND |
| **MatchStatus** | SUGGESTED, ACCEPTED, REJECTED, PENDING_REVIEW |
| **ClaimStatus** | PENDING, APPROVED, REJECTED, AWAITING_PICKUP, HANDED_OVER, CLOSED |
| **NotificationType** | ITEM_MATCH, ITEM_CLAIMED, ITEM_RETURNED, REWARD_EARNED, REWARD_REDEEMED, GENERAL |
| **NotificationChannel** | IN_APP, EMAIL, BOTH |
| **Role** | USER, ADMIN |
| **AuditAction** | (various admin actions) |
| **EvidenceStatus** | (claim verification states) |
| **RewardTransactionType** | CREDIT, DEBIT |

#### 3. **Controllers** (`controllers/`)
REST API endpoints organized by domain:

| Controller | Base Path | Responsibilities |
|-----------|-----------|-----------------|
| **AuthController** | `/auth/` | Registration, login, password reset, profile management |
| **ItemController** | `/items/` | CRUD operations, filtering, searching, pagination |
| **MatchController** | `/matches/` | Matching operations, review queue, acceptance/rejection |
| **ClaimController** | (embedded in Match) | Claim lifecycle management |
| **NotificationController** | `/api/notifications/` | CRUD, read/unread status, delivery channels |
| **RewardController** | `/api/rewards/` | Points transactions, balance queries, history |
| **AdminClaimController** | `/admin/claims/` | Admin claim review, approval, evidence requests |
| **AdminAnalyticsController** | `/admin/analytics/` | System metrics, reporting, analytics |
| **AdminAuditController** | `/admin/audit/` | Audit log queries, compliance reports |
| **UserController** | `/users/` | Profile operations, photo uploads |
| **SupportController** | `/support/` | Support ticket submission |
| **EventController** | `/api/events/` | Internal event publishing (item matched, claimed, etc.) |

#### 4. **Services** (`services/`)
Business logic layer with interface + implementation pattern:

| Service | Key Responsibilities |
|---------|-------------------|
| **AuthService** | User authentication, token generation, password management |
| **ItemService** | Item CRUD, search, filtering, status management |
| **MatchingEngine** | Similarity scoring, automated matching algorithm |
| **ClaimService** | Claim lifecycle, status transitions, validation |
| **NotificationService** | Multi-channel notification dispatch |
| **RewardService** | Points calculation, ledger management, redemption |
| **AdminAnalyticsService** | System metrics, reporting, KPI calculation |
| **AuditLogService** | Action logging, compliance tracking |
| **UserService** | User profile, registration validation |
| **EmailService** | SMTP integration for notifications |

#### 5. **Repositories** (`repositories/`)
Spring Data JPA persistence layer (10+ repositories):

- `UserRepository` - find by username, email
- `ItemRepository` - queries by type, status, user, category, location
- `ItemMatchRepository` - confidence score filtering, status queries
- `ClaimRepository` - status-based queries, pagination
- `NotificationRepository` - user notifications, read status filtering
- `RewardLedgerRepository` - user transaction history, balance
- `AuditLogRepository` - action history, entity tracking
- `PickupScheduleRepository` - scheduled handovers
- `EvidenceRequestRepository` - pending evidence queries

#### 6. **Authentication** (`auth/`)
JWT security implementation:

| Class | Purpose |
|-------|---------|
| **JwtUtil** | Token creation, validation, expiration (default: 6 hours) |
| **JwtAuthenticationFilter** | Request interceptor for token validation |
| **RestAuthenticationEntryPoint** | Unauthorized request handling |
| **AuthenticatedUser** | Current user context (Principal) |

#### 7. **Configuration** (`config/`)

| Config Class | Purpose |
|-----------|---------|
| **SecurityConfig** | Spring Security rules, JWT filter chain, CORS setup |
| **CorsConfig** | Cross-origin request handling |
| **WebConfig** | MVC configuration |
| **PasswordConfig** | Password encoding (BCrypt) |
| **DataSeeder** | Test data initialization on startup |

#### 8. **DTOs** (`dto/`)
Request/Response objects (25+ classes):
- `AuthResponse`, `LoginRequest`, `RegisterRequest`
- `ItemRequestDTO`, `ItemResponseDTO`
- `ClaimResponseDTO`, `ClaimListResponseDTO`
- `MatchResponseDTO`, `RunMatchingRequest`
- `NotificationResponse`, `SendNotificationRequest`
- `RewardBalanceResponse`, `RewardTransactionRequest`, `RewardLedgerEntryResponse`
- `AuditLogResponseDTO`, `AnalyticsResponseDTO`
- And more for profile updates, password reset, evidence, etc.

#### 9. **Events** (`events/`)
Event-driven architecture components:

| Event | Triggers | Listeners |
|-------|----------|-----------|
| **ItemCreatedEvent** | New lost/found report | Matching engine, notifications |
| **ItemMatchedEvent** | Match found | Notification dispatcher |
| **FoundItemSubmittedEvent** | Found item reported | Reward system, notifications |
| **ItemClaimedEvent** | Item claimed | Pickup scheduling, notifications |
| **NotificationEventListener** | (Generic listener) | Distributes events to handlers |

#### 10. **Exception Handling** (`exceptions/`)
Custom exceptions:
- `ResourceNotFoundException`
- `DuplicateUsernameException`
- `ClaimNotFoundException`
- `InvalidClaimStatusTransitionException`
- `GlobalExceptionHandler` - Centralized error response

#### 11. **Matching Engine** (`matching/`)
- **MatchingEngine** - Core algorithm for similarity scoring between lost/found items

---

## Frontend Structure

### Location
`frontend/src/`

### Pages (23 total)
User-facing page components:

| Page | Route | Purpose |
|------|-------|---------|
| **Home** | `/` | Landing page |
| **Login** | `/login` | Authentication |
| **Registration** | `/registration` | User signup |
| **Dashboard** | `/dashboard` | User home, quick stats |
| **BrowseItems** | `/browse` | Search/filter lost & found items |
| **PostLostForm** | `/post-lost` | Report lost item |
| **PostFoundForm** | `/post-found` | Report found item |
| **MyReports** | `/my-reports` | User's submitted items |
| **MatchResults** | `/matches` | View matches for user's items |
| **ClaimItem** | `/claim/:matchId` | Claim ownership process |
| **ReturnItem** | `/return/:itemId` | Initiate item handover |
| **Notifications** | `/notifications` | View all notifications |
| **Rewards** | `/rewards` | Points balance & history |
| **Profile** | `/profile` | User profile & settings |
| **Settings** | `/settings` | Preferences & account settings |
| **ForgotPassword** | `/forgot-password` | Password reset request |
| **ResetPassword** | `/reset/:token` | Password reset confirmation |
| **Chat** | `/chat` | Direct messaging (if implemented) |
| **AdminDashboard** | `/admin/` | (See Admin section) |
| **AdminAnalytics** | `/admin/analytics` | (See Admin section) |
| **AdminReports** | `/admin/reports` | (See Admin section) |
| **AdminUsers** | `/admin/users` | (See Admin section) |
| **HelpSupport** | `/help` | FAQ & support contact |
| **About** | `/about` | System information |
| **Contact** | `/contact` | Contact page |

### Components (6 total)
Reusable UI components:

| Component | Purpose |
|-----------|---------|
| **Navbar** | Top navigation, user menu, logout |
| **Sidebar** | Left navigation, menu links |
| **PostLostForm** | Form for reporting lost items |
| **PostFoundForm** | Form for reporting found items |
| **PostItem** | Display single item card |
| **PostList** | Display list of items with pagination |

### API Modules (`api/`)

| Module | Endpoints |
|--------|-----------|
| **auth.js** | registerUser, loginUser, logoutUser, updateProfile, uploadProfilePhoto, requestPasswordReset, confirmPasswordReset, changePassword |
| **items.js** | getAllItems, getItemById, searchItems, getItemsByType, getItemsByTypeAndStatus, createItem, deleteItem |
| **matches.js** | getMyMatches, runMatchingForFilteredLostItems |
| **notifications.js** | (Integration point) |
| **client.js** | HTTP wrapper with auth, error handling, 401 redirect |

### Utilities (`utils/`)
- **formatters.js** - Date/time, status, confidence score formatting

### Assets
- Mock data for development
- Icons, images, styling

### Tech Stack
- **React 19.2.4** - UI framework
- **React Router 7.15.0** - Client-side routing
- **Lucide React** - Icon library
- **Vite 8.0.1** - Build tool & dev server

---

## Admin Application

### Location
`admin/src/`

### Components
Structured as a single-app admin dashboard with routes:

| Route | Purpose |
|-------|---------|
| `/admin/claims` | Claims queue - review, approve/reject claims |
| `/admin/lost-items` | Lost items management |
| `/admin/found-items` | Found items management |
| `/admin/analytics` | System analytics, reporting |
| `/admin/audit-log` | Admin action history, compliance |

### Admin Features
- **Claims Review Queue**: Filter by status (PENDING, IN_CONFLICT, APPROVED, REJECTED)
- **Item Management**: Update status, delete items
- **Analytics**: Reports over 7d/30d/semester/all periods
- **Audit Logging**: Track all admin actions
- **User Management**: View user details, activity
- **Pickup Scheduling**: Schedule item handovers
- **Evidence Requests**: Request additional proof from claimants

### Services (`services/adminApi.js`)
Functions for admin operations:
- `getCurrentAdmin` - Get logged-in admin user
- `getClaims` - Fetch claims with filters
- `approveClaim`, `rejectClaim` - Claim decisions
- `requestMoreEvidence` - Evidence requests
- `schedulePickup` - Schedule handover
- `getAnalytics` - System metrics
- `getAuditLog` - Admin action history
- `getAdminItems` - Item management
- `deleteItem`, `updateItemStatus` - Item operations
- `getUserDetails` - User profile lookup

### Styling
- `App.css`, `index.css` - CSS styling

### Tech Stack
- **React 19.2.4** - UI framework
- **Vite 8.0.1** - Build tool
- Same as frontend

---

## Database Structure

### Location
- **Schema**: `backend/src/main/resources/db/schema.sql`
- **Seed Data**: `backend/src/main/resources/db/seed_admin.sql`
- **Test Data**: `tests/db/test-data.sql`

### Tables (13 total)

| Table | Primary Purpose | Key Columns |
|-------|-----------------|------------|
| **users** | User accounts | id, username, email, password_hash, role, fullName, phone, studentId, faculty, department, yearOfStudy, createdAt |
| **items** | Lost/found reports | id, user_id, title, description, category, location, report_type, status, created_at, updated_at |
| **item_images** | Item photos | id, item_id, image_url, created_at |
| **item_matches** | Lost-found pairings | id, lost_item_id, found_item_id, confidence_score (0.00-1.00), status, created_at, updated_at |
| **claims** | Ownership claims | id, item_match_id, claimant_id, status, evidence, requested_at, updated_at |
| **evidence_requests** | Evidence collection | id, claim_id, details, status, created_at, responded_at |
| **pickup_schedules** | Handover scheduling | id, claim_id, schedule_date, location, created_at |
| **notifications** | Multi-channel messages | id, user_id, type, title, message, is_read, channel, reference_item_id, created_at, read_at |
| **reward_ledger** | Points transactions | id, user_id, points, transaction_type, description, reference_id, created_at |
| **audit_logs** | Admin action history | id, admin_id, action, entity_type, entity_id, outcome, notes, timestamp |

### Enums (PostgreSQL)
```sql
report_type_enum: LOST, FOUND
item_status_enum: OPEN, MATCHED, CLAIMED, PENDING_REVIEW, AWAITING_PICKUP, SCHEDULED_FOR_AUCTION, SCHEDULED_FOR_DONATION, CLOSED
match_status_enum: SUGGESTED, ACCEPTED, REJECTED, PENDING_REVIEW
user_role_enum: USER, ADMIN
```

### Indexes
Performance-optimized with 25+ indexes on:
- user_id, report_type, status, confidence_score, created_at
- User/admin lookups, date ranges, composite keys

### Relationships
- **Items** → **Users** (many-to-one)
- **ItemMatches** → **Items** (many-to-one on both lost & found)
- **Claims** → **ItemMatches** (one-to-one, unique constraint)
- **Claims** → **Users** (many-to-one on claimant)
- **PickupSchedules** → **Claims** (many-to-one)
- **EvidenceRequests** → **Claims** (one-to-many)
- **Notifications** → **Users** (many-to-one)
- **AuditLogs** → **Users** (many-to-one on admin)
- **RewardLedger** → **Users** (many-to-one)

---

## API Endpoints

### Base URLs
- **Backend API**: `http://localhost:8081` (default)
- **Frontend wrapper**: Uses `VITE_API_BASE_URL` environment variable
- **Admin API**: Uses same backend with admin token auth

### Authentication Endpoints
```
POST   /auth/register              - Register new user
POST   /auth/login                 - Authenticate user
GET    /auth/me                    - Get current user profile
POST   /auth/forgot-password       - Request password reset
POST   /auth/reset-password        - Confirm password reset
POST   /auth/change-password       - Change authenticated user password
```

### Item Management Endpoints (16+ endpoints)
```
POST   /items                      - Create lost/found item
GET    /items                      - List all items
GET    /items/{itemId}             - Get single item
GET    /items/type/{reportType}    - Filter by type (LOST/FOUND)
GET    /items/status/{status}      - Filter by status
GET    /items/user/{userId}        - User's items
GET    /items/filter               - Combined filtering (type, status)
GET    /items/search               - Full-text search
GET    /items/category             - Search by category
GET    /items/location             - Search by location
GET    /items/paginated            - Paginated results
PUT    /items/{itemId}/status      - Update status
POST   /items/{itemId}/images      - Add image URL
DELETE /items/{itemId}             - Delete item
```

### Matching Endpoints
```
POST   /matches/run                - Run matching for single item
POST   /matches/run-filtered       - Run matching for multiple items
GET    /matches/my                 - User's visible matches
GET    /matches/review-queue       - Admin review queue
GET    /matches                    - Query with filters
GET    /matches/{matchId}          - Single match details
POST   /matches/{matchId}/confirm  - Confirm/accept match
POST   /matches/{matchId}/reject   - Reject match
POST   /matches/review-queue/{matchId}/approve   - Admin approval
POST   /matches/review-queue/{matchId}/reject    - Admin rejection
```

### Notification Endpoints (6+ endpoints)
```
POST   /api/notifications          - Send notification
GET    /api/notifications/users/{userId}         - All notifications
GET    /api/notifications/users/{userId}/unread  - Unread only
GET    /api/notifications/users/{userId}/unread-count  - Count
PATCH  /api/notifications/{notificationId}/read  - Mark as read
PATCH  /api/notifications/users/{userId}/read-all - Mark all read
```

### Reward Endpoints
```
POST   /api/rewards/transactions   - Record transaction (CREDIT/DEBIT)
GET    /api/rewards/users/{userId} - Balance & history
GET    /api/rewards/users/{userId}/balance - Current balance
```

### User/Profile Endpoints
```
PUT    /users/me                   - Update profile
POST   /users/me/photo             - Upload profile photo
```

### Support Endpoints
```
POST   /support                    - Submit support ticket
```

### Admin Endpoints (claim management)
```
GET    /admin/claims               - List claims
POST   /admin/claims/{claimId}/approve  - Approve
POST   /admin/claims/{claimId}/reject   - Reject
POST   /admin/claims/{claimId}/evidence - Request evidence
POST   /admin/claims/{claimId}/pickup   - Schedule pickup
```

### Admin Analytics Endpoints
```
GET    /admin/analytics            - System metrics & KPIs
```

### Admin Audit Endpoints
```
GET    /admin/audit                - Audit log queries
```

### Event Publishing Endpoints (Internal)
```
POST   /api/events/item-matched    - Notify match found
POST   /api/events/found-item-submitted - Reward trigger
POST   /api/events/item-claimed    - Claim notification
```

### Matching Engine Endpoints (Separate service)
```
POST   /api/v1/matches/trigger/lost/{lostItemId}
POST   /api/v1/matches/trigger/found/{foundItemId}
POST   /api/v1/matches/recalculate
GET    /api/v1/matches/lost/{lostItemId}
GET    /api/v1/matches/found/{foundItemId}
GET    /api/v1/matches/{matchId}
POST   /api/v1/matches/{matchId}/confirm
POST   /api/v1/matches/{matchId}/reject
GET    /api/v1/matches/queue
POST   /api/v1/matches/queue/{matchId}/resolve
```

---

## Documentation Status

### Existing Documentation
✅ **Well Documented**:
- [docs/backend/endpoints.md](docs/backend/endpoints.md) - Complete REST API reference
- [docs/frontend/api-integration.md](docs/frontend/api-integration.md) - Frontend-backend contract
- [backend/README.md](backend/README.md) - Backend setup, env variables, module overview
- [frontend/README.md](frontend/README.md) - Frontend module overview
- [tests/NOTIFICATION_TEST_SCENARIOS.md](tests/NOTIFICATION_TEST_SCENARIOS.md) - Notification API testing
- [tests/db/README.md](tests/db/README.md) - Test data setup
- Database schema with SQL seed files
- Postman collection for API testing

### Documentation Gaps
❌ **Missing/Incomplete**:

1. **Sequence Diagrams** - Exist but incomplete:
   - [x] 01_authentication.mmd - Exists
   - [x] 02_reporting_and_social.mmd - Exists
   - [x] 03_matching_and_notification.mmd - Exists
   - [x] 04_claim_and_verification.mmd - Exists
   - [x] 05_content_moderation_and_conflict_resolution.mmd - Exists
   - [x] 06_inventory_clearence.mmd - Exists
   - ❓ Need to verify completeness

2. **Backend Code Documentation**:
   - ❌ Limited JavaDoc on service classes
   - ❌ No architecture decision record (ADR)
   - ❌ No design patterns documentation
   - ❌ Matching engine algorithm explanation missing

3. **Frontend Code Documentation**:
   - ❌ No component prop documentation
   - ❌ Limited inline comments
   - ❌ No state management docs

4. **Admin Application**:
   - ❌ No dedicated README for admin app
   - ❌ Limited documentation on admin workflows
   - ❌ No permission/role documentation

5. **Deployment & DevOps**:
   - ❌ No Docker setup documentation
   - ❌ No deployment guides
   - ❌ No CI/CD pipeline documentation
   - ❌ No production configuration guide

6. **Testing**:
   - ⚠️ Test scenarios documented
   - ❌ No unit test examples
   - ❌ No integration test documentation
   - ❌ No E2E test documentation

7. **Configuration**:
   - ✅ Env variables documented
   - ❌ No database migration guide
   - ❌ No feature flags documentation
   - ❌ No performance tuning guide

8. **Security**:
   - ❌ No security architecture documentation
   - ❌ No vulnerability assessment
   - ❌ No OWASP coverage documentation
   - ❌ No data privacy documentation (GDPR/local compliance)

9. **System Design**:
   - ❌ No ER diagram documentation
   - ❌ No system architecture diagram
   - ❌ No data flow diagrams
   - ❌ No deployment architecture

10. **User Guides**:
    - ❌ No user manual
    - ❌ No admin manual
    - ❌ No troubleshooting guide

---

## Summary of Findings

### Strengths ✅
1. **Well-architected backend** - Clear separation of concerns, layered architecture
2. **Comprehensive API** - 50+ endpoints covering all major features
3. **Database design** - Normalized schema, proper indexes, foreign keys
4. **Multi-channel notifications** - Email, in-app, both channels
5. **Event-driven architecture** - Asynchronous event handling
6. **Reward system** - Gamification with points, transactions, redemption
7. **Admin dashboard** - Dedicated admin UI with analytics, auditing, claim management
8. **Security** - JWT authentication, password hashing, CORS config
9. **Matching engine** - Automated matching with confidence scoring
10. **API documentation** - Good endpoint documentation exists

### Areas Needing Attention ⚠️
1. **Production readiness** - Missing deployment, Docker, CI/CD documentation
2. **Code documentation** - Limited JavaDoc, no architectural patterns explained
3. **Testing** - Test scenarios documented but missing unit/integration tests
4. **Security review** - No documented security assessment or compliance
5. **Scalability** - No discussion of load testing, caching, optimization
6. **Frontend architecture** - No state management (Redux, Context API) documentation
7. **Admin functionality** - Admin app exists but lacks comprehensive documentation
8. **Error handling** - No comprehensive error handling guide
9. **Matching algorithm** - Core engine not documented in detail
10. **Version control** - No documented branching strategy or release process

### Immediate Recommendations
1. Add architecture decision records (ADRs)
2. Document deployment process & Docker setup
3. Create visual architecture diagrams (ER, component, deployment)
4. Add comprehensive JavaDoc to service classes
5. Document the matching algorithm in detail
6. Create user & admin manuals
7. Set up automated testing documentation
8. Add security & compliance documentation

---

**End of Exploration Summary**
