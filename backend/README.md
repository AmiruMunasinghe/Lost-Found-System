# Backend (Spring Boot)

## Overview
This module contains the **backend REST API** for the Lost and Found Management System.

It is responsible for handling all business logic, data processing, and system operations.

---

## Responsibilities
- User authentication and authorization (JWT)
- Lost and found item management
- Matching engine
- Notification system
- Admin operations
- Database interaction

---

## Core Modules
- Authentication (Login, Registration)
- Item Catalogue (Lost/Found items)
- Matching Engine
- Notification System
- Admin Management
- Reward System

---

## Tech Stack
- Spring Boot
- RESTful API
- (Database: TBD)

---

## API Responsibilities
- Secure endpoints using JWT
- Provide CRUD operations
- Handle business logic
- Communicate with frontend via JSON

---

## Notes
- This backend serves both:
  - User frontend
  - Admin frontend

---

## Environment Variables Setup

Create a `.env` file in the `backend/` folder (same level as `pom.xml`).  
The app reads it automatically via `spring.config.import=optional:file:.env[.properties]`.

### `.env` file template

```properties
# ── Database ──────────────────────────────────────────────────────────────────
DB_URL=jdbc:postgresql://localhost:5432/lostfound
DB_USER=your_db_username
DB_PASSWORD=your_db_password

# ── Email / SMTP (required for Notification & Reward email alerts) ────────────
# Gmail example: enable "App Passwords" under Google Account → Security
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password

# Sender address shown in outgoing notification emails
NOTIFICATION_FROM_EMAIL=notifications@lostfound.edu

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET=replace-with-a-long-random-secret-key-at-least-256-bits
```

> **Note:** Never commit the actual `.env` file to the repository.  
> A `.env` entry has already been added to `.gitignore`.

### What each variable does

| Variable | Used by | Required |
|---|---|---|
| `DB_URL` | Spring JPA datasource | Yes |
| `DB_USER` | Spring JPA datasource | Yes |
| `DB_PASSWORD` | Spring JPA datasource | Yes |
| `MAIL_HOST` | `EmailService` – SMTP server | Yes (for emails) |
| `MAIL_PORT` | `EmailService` – SMTP port (587 = TLS) | Yes (for emails) |
| `MAIL_USERNAME` | `EmailService` – SMTP login | Yes (for emails) |
| `MAIL_PASSWORD` | `EmailService` – SMTP password / App Password | Yes (for emails) |
| `NOTIFICATION_FROM_EMAIL` | Sender address on all notification emails | Yes (for emails) |
| `JWT_SECRET` | `JwtUtil` – token signing key | Yes |

> If email variables are not set, the app **will still start** but email notifications will fail silently (errors are logged, not thrown).
