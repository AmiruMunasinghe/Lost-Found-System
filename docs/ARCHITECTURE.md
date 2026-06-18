# System Architecture

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Component Interaction](#component-interaction)
4. [Technology Stack](#technology-stack)
5. [Data Flow](#data-flow)
6. [Security Architecture](#security-architecture)

---

## Overview

The Lost & Found Management System is a comprehensive web application designed to help users report, track, and recover lost or found items. The system includes:
- **User-facing application** for posting and finding items
- **Admin dashboard** for monitoring and managing the system
- **Backend API** for all business logic and data persistence
- **Database** for storing all persistent data

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                        │
├────────────────────────┬──────────────────────────────────────┤
│   User Frontend        │      Admin Frontend                   │
│   (React)              │      (React)                          │
│                        │                                      │
│  - Home               │  - Claims Queue                      │
│  - Browse Items       │  - Item Management                   │
│  - Post Items         │  - Analytics                         │
│  - Matching           │  - Audit Logs                        │
│  - Claims             │  - User Management                   │
│  - Notifications      │                                      │
│  - Profile            │                                      │
└────────────────────────┴──────────────────────────────────────┘
                         │
                    HTTP/REST API
                         │
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway & Auth                        │
├─────────────────────────────────────────────────────────────┤
│            JWT Authentication & Authorization                 │
└─────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│                  Backend Layer (Spring Boot)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Controllers Layer                        │   │
│  │  ┌─────────────┬─────────────┬──────────────────┐   │   │
│  │  │  AuthCtrl   │  ItemCtrl   │  MatchCtrl       │   │   │
│  │  │  ClaimCtrl  │  NotifyCtrl  │  AdminCtrl       │   │   │
│  │  │  RewardCtrl │  UserCtrl    │  AuditCtrl       │   │   │
│  │  └─────────────┴─────────────┴──────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Service Layer                           │   │
│  │  ┌─────────────┬─────────────┬──────────────────┐   │   │
│  │  │ AuthService │ ItemService │ MatchService     │   │   │
│  │  │ ClaimService│ NotifyService│ AuditService     │   │   │
│  │  │ RewardService│UserService  │ AdminService     │   │   │
│  │  └─────────────┴─────────────┴──────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Repository Layer (Data Access)             │   │
│  │  ┌─────────────┬──────────────┬────────────────┐   │   │
│  │  │ UserRepo    │ ItemRepo     │ MatchRepo      │   │   │
│  │  │ ClaimRepo   │ NotifyRepo   │ AuditRepo      │   │   │
│  │  │ RewardRepo  │ SettingsRepo │                │   │   │
│  │  └─────────────┴──────────────┴────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┬────────────┬──────────────────────────┐   │
│  │  User        │  Item      │  Notification            │   │
│  │  ItemMatch   │  Claim     │  AuditLog                │   │
│  │  RewardLedger│ Settings   │  VerificationCode        │   │
│  │  Activity    │ Message    │                          │   │
│  └──────────────┴────────────┴──────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Interaction

### 1. **User Registration & Authentication Flow**
```
User Frontend
    │
    ├─→ POST /auth/register
    │   └─→ AuthController
    │       └─→ AuthService
    │           ├─→ UserRepository (validate uniqueness)
    │           └─→ PasswordEncoder (hash password)
    │               └─→ Database (save user)
    │
    └─→ Response: JWT Token + User Info
```

### 2. **Item Posting & Matching Flow**
```
User Frontend
    │
    ├─→ POST /items (with image)
    │   └─→ ItemController
    │       └─→ ItemService
    │           ├─→ ImageStorage (upload image)
    │           └─→ ItemRepository (save item)
    │               └─→ Database (persist)
    │
    ├─→ Async: MatchingService
    │   ├─→ Retrieve all items of opposite type
    │   ├─→ Run matching algorithm
    │   └─→ Create ItemMatch records
    │       └─→ Trigger notifications
    │
    └─→ Response: Item ID + Status
```

### 3. **Claim Management Flow**
```
User Frontend
    │
    ├─→ POST /items/{id}/claim
    │   └─→ ClaimController
    │       └─→ ClaimService
    │           ├─→ Validate ownership
    │           ├─→ Create Claim (PENDING)
    │           └─→ Notify admin & item poster
    │
    ├─→ Admin Frontend
    │   ├─→ GET /admin/claims (PENDING)
    │   └─→ PUT /admin/claims/{id}/approve
    │       └─→ ClaimService
    │           ├─→ Request verification from claimant
    │           ├─→ Update Claim status
    │           └─→ Schedule pickup
    │
    └─→ Claim Process: PENDING → APPROVED → VERIFIED → COMPLETED
```

### 4. **Notification System Flow**
```
Backend Service (async)
    │
    ├─→ Event triggered (Item posted, Claim created, Match found)
    │   └─→ NotificationService
    │       ├─→ Create Notification record
    │       ├─→ Determine channels (IN_APP, EMAIL, BOTH)
    │       ├─→ Queue notification delivery
    │       └─→ Send via appropriate channels
    │           ├─→ IN_APP: Store in database
    │           ├─→ EMAIL: Queue to mail service
    │           └─→ Audit event
    │
    └─→ Frontend: Poll /notifications or WebSocket
```

---

## Technology Stack

### Frontend
- **Framework**: React 19.2.4
- **Build Tool**: Vite 5.4.11
- **Routing**: React Router 7.15.0
- **HTTP Client**: Native Fetch API with custom wrapper
- **Styling**: CSS Modules + CSS3
- **State Management**: React hooks with Context API

### Admin Frontend
- **Framework**: React 19.2.4
- **Build Tool**: Vite 5.4.11
- **Routing**: React Router
- **Purpose**: Claims management, analytics, admin operations

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Build Tool**: Maven
- **Database**: PostgreSQL 13+
- **Authentication**: JWT (6-hour token expiration)
- **ORM**: Spring Data JPA
- **API Documentation**: OpenAPI/Swagger (recommended)

### Database
- **DBMS**: PostgreSQL 13+
- **Connections**: HikariCP connection pooling
- **Migrations**: Flyway (recommended)
- **Performance**: 25+ optimized indexes

### Deployment & DevOps
- **Container**: Docker (recommended)
- **CI/CD**: GitHub Actions (recommended)
- **Monitoring**: Application logging with SLF4J/Logback

---

## Data Flow

### 1. **HTTP Request Flow**
```
1. Frontend makes HTTP request
   ├─ Authorization header (JWT token)
   ├─ Content-Type: application/json
   └─ Payload (if POST/PUT)

2. API Gateway
   ├─ Validate JWT token
   ├─ Extract user context
   └─ Route to appropriate controller

3. Controller
   ├─ Validate request parameters
   ├─ Extract user context from JWT
   └─ Delegate to service layer

4. Service Layer
   ├─ Implement business logic
   ├─ Call repository methods
   ├─ Handle transactions
   └─ Return result

5. Repository Layer
   ├─ Build queries
   ├─ Execute database operations
   └─ Return data objects

6. Response
   ├─ Serialize to JSON
   ├─ Set appropriate HTTP status
   └─ Return to frontend
```

### 2. **Async Event Flow**
```
Synchronous Operation (e.g., POST /items)
    └─→ Item saved to database
        └─→ Fire ApplicationEvent
            └─→ EventListener (async)
                ├─→ Query related items
                ├─→ Run matching algorithm
                ├─→ Create notifications
                ├─→ Queue emails
                └─→ Audit logging
```

---

## Security Architecture

### 1. **Authentication**
- JWT-based stateless authentication
- 6-hour token expiration
- Refresh token mechanism (recommended)
- Password hashing with BCrypt

### 2. **Authorization**
- Role-based access control (RBAC)
- Roles: USER, ADMIN
- Method-level security with @Secured/@PreAuthorize annotations
- Resource-level access control for user-specific data

### 3. **Data Protection**
- HTTPS/TLS for all communications
- Password encryption at rest
- Sensitive data (email, phone) encrypted in database
- CORS configured for frontend origins

### 4. **API Security**
- Input validation at all endpoints
- SQL injection prevention via parameterized queries
- CSRF protection (if applicable)
- Rate limiting (recommended)
- Audit logging for sensitive operations

### 5. **Database Security**
- User authentication required
- Connection pooling with SSL
- Minimum privilege principle for database users
- Regular backups and disaster recovery

---

## Scaling Considerations

### Current Architecture (Single Instance)
- Suitable for small to medium-scale deployments
- Synchronous processing adequate for moderate load

### Recommended Improvements for Scale
1. **Message Queue**: RabbitMQ/Kafka for async notification processing
2. **Caching**: Redis for frequently accessed data (items, matches)
3. **Load Balancing**: Nginx/HAProxy for multiple backend instances
4. **Database Scaling**: Read replicas for read-heavy queries
5. **CDN**: CloudFront/Cloudflare for static assets
6. **Search**: Elasticsearch for advanced item searching

---

## Performance Optimization

### Database Indexes
- Created on frequently queried fields (userId, itemType, status, createdAt)
- Composite indexes for common filter combinations
- JSONB indexes for metadata queries

### Caching Strategy
- Frontend: Browser caching via HTTP headers
- Backend: Optional in-memory caching for user sessions
- Database: Query result caching for static data

### API Response Optimization
- Pagination for list endpoints (default 20 items/page)
- Field filtering to return only needed data
- Compression of responses (gzip)

---

## Monitoring & Logging

### Logging Strategy
- Structured logging with SLF4J/Logback
- Log levels: DEBUG (dev), INFO (prod)
- Audit logs for all sensitive operations
- Error tracking and alerting

### Metrics to Monitor
- API response times (p50, p95, p99)
- Database query performance
- JWT validation success/failure rate
- Notification delivery success rate
- Active user sessions
- Error rates by endpoint

---

## Development Environment Setup

See the individual component guides for setup instructions:
- [Backend Developer Guide](backend/DEVELOPER_GUIDE.md)
- [Frontend Developer Guide](frontend/DEVELOPER_GUIDE.md)
- [Database Setup](database/SETUP.md)

---

**Last Updated**: 2026-06-18
