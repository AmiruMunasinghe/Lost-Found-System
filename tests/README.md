# Tests

## Overview
This directory contains all testing-related code and configurations for the Lost and Found Management System.

---

## Directory Structure

```
tests/
├── README.md                              (this file)
├── postman/                               (Postman API testing)
│   ├── README.md                          (Postman guide)
│   ├── Lost-Found-Item-Management.postman_collection.json
│   └── Lost-Found-LocalDev.postman_environment.json
└── [Other test files/folders as added]
```

---

## Postman API Testing

See [postman/README.md](postman/README.md) for detailed setup and usage instructions.

**Quick Start:**
1. Import `postman/Lost-Found-Item-Management.postman_collection.json`
2. Import `postman/Lost-Found-LocalDev.postman_environment.json`
3. Select environment and run requests

---

## Purpose
- Ensure system reliability and correctness
- Validate functional and non-functional requirements
- Detect bugs early

---

## Types of Tests
- **Unit Tests** - Backend business logic (JUnit + Mockito)
- **Controller Tests** - API endpoints with Spring MockMvc
- **API Tests** - HTTP requests with Postman
- **Integration Tests** - Database and service layer interactions
- (Optional) End-to-End Tests

---

## Scope
- Backend API testing
- Business logic validation
- Frontend component testing (if applicable)

---

## Tools
- **JUnit 5** / Spring Boot Test (Backend unit/controller tests)
- **Postman** (API testing and collections)
- **Jest** / React Testing Library (Frontend - if applicable)
- **Mockito** (Mocking and verification in unit tests)

---

## Running Tests

### Backend Unit Tests
```bash
cd backend
mvn clean test                              # Run all tests
mvn test -Dtest=ItemServiceImplTest        # Run specific test class
mvn test -Dtest=ItemControllerTest         # Run specific test class
```

### Postman Collection Tests
1. Open Postman
2. Import collection from `postman/`
3. Select environment
4. Run requests or use Collection Runner

---

## Notes
- Aim for high test coverage (≥80% recommended)
- Tests should align with requirements
- Keep tests organized in dedicated subdirectories by type