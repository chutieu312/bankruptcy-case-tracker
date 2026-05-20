# JD Practice Plan — Stretto Full Stack Software Engineer

---

## Original JD Summary

**Company:** Stretto — case management, depository solutions, and technology tools for fiduciaries and legal professionals in the bankruptcy ecosystem.

**Role:** Full Stack Software Engineer

**Core Responsibilities:**
- Design, develop, and deliver end-to-end enterprise solutions
- Own features from concept to deployment
- Identify and fix performance, security, and stability issues
- Design, develop, and maintain CI/CD pipelines

---

## 1. JD Skill Extraction

### Required Technical Skills
- Java, Spring Boot, JSF, Hibernate, Spring JPA
- Node.js
- JavaScript, TypeScript, ReactJS, Angular, CSS, HTML
- AWS: EC2, ECS, Lambda, S3, SQS
- Complex SQL queries
- CI/CD pipelines (end-to-end)

### Preferred Technical Skills
- Python
- AI tools: Claude Code, Amazon Kiro, GitHub Copilot

### Methodology / Process
- Agile: Scrum / Kanban
- Cross-functional collaboration
- Performance optimization and security vulnerability remediation

### Soft Skills
- Excellent problem-solving
- Adaptability to new technologies
- Strong communication and teamwork

---

## 2. Skill Categories

| Category | Skills Found | Priority |
|---|---|---|
| Backend | Java, Spring Boot, Hibernate, Spring JPA, Node.js | Required |
| Frontend | JavaScript, TypeScript, ReactJS, Angular, CSS, HTML | Required |
| Database | Complex SQL, relational DB (implied by Hibernate/JPA) | Required |
| Cloud | AWS EC2, ECS, Lambda, S3, SQS | Required |
| DevOps / CI-CD | End-to-end CI/CD pipelines | Required |
| Testing | Implied by enterprise quality standards | Required |
| Security | Security vulnerability identification and remediation | Required |
| AI Tools | Claude Code, Amazon Kiro, GitHub Copilot | Preferred |
| Other | Agile/Scrum/Kanban, Python | Preferred |

---

## 3. Recommended Mini Project

### Bankruptcy Case Tracker Dashboard

A simplified full-stack case management web application for tracking bankruptcy cases — directly inspired by Stretto's core business domain.

**One-line description:**
A web app where legal professionals can create, search, and manage bankruptcy cases, upload case documents, and receive async status-change notifications.

**The project is:**
- Small enough to build in a weekend
- Easy to run locally with Docker Compose
- Easy to explain in a 5-minute interview demo
- Directly tied to Stretto's real business domain (bankruptcy case management)

---

## 4. Why This Project Matches the JD

| JD Responsibility | Project Feature |
|---|---|
| Design and deliver end-to-end enterprise solutions | Full Spring Boot API + React frontend + PostgreSQL |
| Performance bottlenecks and security vulnerabilities | JWT auth, input validation, SQL parameterized queries, CORS config |
| End-to-end CI/CD pipelines | GitHub Actions: build → test → Docker push → deploy |
| AWS Cloud services and serverless computing | S3 document storage, SQS async notification, Lambda consumer |
| Complex SQL queries | Case search with filters, aggregations, joins |
| React / TypeScript UI | React + TypeScript dashboard with API integration |
| Agile delivery | GitHub Issues + feature branches + PRs |

---

## 5. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│         React + TypeScript (Vite)                       │
│    Cases List │ Case Detail │ Upload │ Login            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST (JSON)
┌──────────────────────▼──────────────────────────────────┐
│               Spring Boot API (Java 21)                 │
│  /api/cases  /api/documents  /api/auth  /api/users      │
│  Spring Security (JWT) │ Spring JPA │ Hibernate         │
└────────┬───────────────────────┬────────────────────────┘
         │ JDBC                  │ AWS SDK
┌────────▼──────────┐   ┌────────▼────────────────────────┐
│   PostgreSQL      │   │  AWS S3  (document storage)     │
│   (Docker local)  │   │  AWS SQS (status notifications) │
└───────────────────┘   │  AWS Lambda (SQS consumer)      │
                        └─────────────────────────────────┘
                                    ↕
                        LocalStack (local AWS simulation)
                        ─────────────────────────────────
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions CI/CD                                   │
│  build → test → docker build → push → deploy           │
└─────────────────────────────────────────────────────────┘
```

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Spring Boot 3 (Java 21) + Spring Security + Spring JPA + Hibernate
- **Database:** PostgreSQL 15 (Docker)
- **Cloud:** AWS S3 (documents), SQS (notifications), Lambda (consumer) — all via LocalStack locally
- **CI/CD:** GitHub Actions
- **Testing:** JUnit 5 + Mockito (backend), Vitest + React Testing Library (frontend)
- **Security:** JWT Bearer tokens, BCrypt password hashing, CORS config, input validation

---

## 6. Tech Stack Mapping

| JD Skill | Project Feature | How to Explain It in an Interview |
|---|---|---|
| Java + Spring Boot | REST API with CRUD endpoints for cases | "I built a Spring Boot 3 REST API with layered architecture — Controller, Service, Repository — following standard enterprise patterns." |
| Hibernate + Spring JPA | Entity models, repositories, relationships | "I used Spring Data JPA with Hibernate as the ORM. I modeled Case, Document, and User entities with one-to-many relationships." |
| ReactJS + TypeScript | Case dashboard, case detail, upload UI | "I built the frontend in React 18 with TypeScript for type safety. I used custom hooks to manage API calls and component state." |
| CSS / HTML | Tailwind CSS utility classes + semantic HTML | "I used Tailwind CSS for a clean, responsive layout without custom CSS overhead." |
| Complex SQL | Case search with filters, date ranges, status aggregations | "I wrote JPQL and native SQL queries for case search — filtering by status, date range, and assignee, plus a summary aggregation query." |
| AWS S3 | Document upload and pre-signed URL download | "I used the AWS SDK to upload case documents to S3 and generate pre-signed URLs for secure, temporary download links." |
| AWS SQS | Async notification queue on case status change | "When a case status changes, the API publishes a message to an SQS queue. A Lambda consumer processes it and sends a notification." |
| AWS Lambda | SQS consumer function (Node.js) | "I wrote a small Node.js Lambda that reads from SQS and logs the notification — simulating an email or webhook trigger." |
| CI/CD Pipeline | GitHub Actions: test → build → Docker → deploy | "I built a GitHub Actions pipeline that runs tests, builds a Docker image, and pushes it to Docker Hub on every main branch push." |
| Security | JWT auth, BCrypt, CORS, input validation | "I implemented JWT-based stateless authentication with Spring Security. Passwords are hashed with BCrypt. All endpoints are protected except login and register." |
| Node.js | Lambda consumer function | "The SQS consumer Lambda is written in Node.js — a lightweight fit for an event-driven function." |
| Agile | GitHub Issues + feature branches + PRs | "I organized the project into phases using GitHub Issues and worked feature-branch to main with PRs — mimicking a Scrum sprint." |
| AI Tools | GitHub Copilot used throughout | "I used GitHub Copilot to accelerate boilerplate and unit test generation — same tools called out in the JD." |

---

## 7. Step-by-Step Build Plan

### Phase 1 — Backend Foundation
- Initialize Spring Boot 3 project (Maven)
- Configure PostgreSQL datasource
- Create `Case`, `User`, `Document` JPA entities
- Implement `CaseRepository`, `CaseService`, `CaseController`
- Add Spring Security with JWT (login + register endpoints)
- Validate with Postman / curl

### Phase 2 — Database Layer
- Write Flyway migration scripts for schema
- Add complex JPQL queries: case search with filters, status aggregation
- Seed data script for demo

### Phase 3 — Frontend UI
- Initialize React 18 + TypeScript + Vite project
- Build login page → case list page → case detail page
- Add document upload form
- Integrate all API calls with Axios + custom hooks
- Style with Tailwind CSS

### Phase 4 — AWS Integration (LocalStack)
- Add LocalStack to docker-compose
- Implement S3 document upload + pre-signed URL download
- Implement SQS publish on case status change
- Write Node.js Lambda SQS consumer (local simulation)

### Phase 5 — Docker
- Write `Dockerfile` for Spring Boot API
- Write `Dockerfile` for React frontend (nginx)
- Write `docker-compose.yml` (API + frontend + PostgreSQL + LocalStack)
- Test full local stack with `docker compose up`

### Phase 6 — Testing
- JUnit 5 + Mockito: unit tests for `CaseService`
- Spring Boot Test: integration test for `CaseController`
- Vitest + React Testing Library: component tests for case list
- Test coverage report

### Phase 7 — CI/CD
- GitHub Actions workflow: lint → test → build → docker push
- Add `.github/workflows/ci.yml`
- Badge in README

### Phase 8 — Cloud Deployment Plan
- Document Railway / Render / AWS ECS deployment steps
- Add environment variable management notes

---

## 8. Project Structure

```
bankruptcy-case-tracker/
├── backend/                          # Spring Boot API
│   ├── src/
│   │   ├── main/java/com/strettodemo/
│   │   │   ├── auth/                 # JWT filter, security config
│   │   │   ├── cases/               # Case entity, repo, service, controller
│   │   │   ├── documents/           # Document entity, S3 service, controller
│   │   │   ├── users/               # User entity, repo, service
│   │   │   └── BankruptcyTrackerApplication.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/        # Flyway SQL scripts
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                         # React + TypeScript
│   ├── src/
│   │   ├── api/                     # Axios client + API hooks
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Login, CaseList, CaseDetail
│   │   ├── types/                   # TypeScript interfaces
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
│
├── lambda/                           # Node.js SQS consumer
│   ├── handler.js
│   └── package.json
│
├── docs/
│   ├── jd-practice-plan.md          # This file
│   └── interview-talking-points.md  # Generated after build
│
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions pipeline
│
└── docker-compose.yml               # Full local stack
```

---

## 9. Local Setup Commands

```bash
# 1. Clone the repo
git clone https://github.com/yourname/bankruptcy-case-tracker.git
cd bankruptcy-case-tracker

# 2. Start the full stack (PostgreSQL + LocalStack + API + Frontend)
docker compose up --build

# 3. API is available at:
#    http://localhost:8080/api

# 4. Frontend is available at:
#    http://localhost:5173  (dev)  or  http://localhost:3000 (Docker)

# 5. Run backend tests only
cd backend
./mvnw test

# 6. Run frontend tests only
cd frontend
npm install
npm test

# 7. Seed demo data (optional)
curl -X POST http://localhost:8080/api/seed
```

---

## 10. Testing Plan

| Layer | Tool | What Is Tested | Why It Matters |
|---|---|---|---|
| Backend Unit | JUnit 5 + Mockito | `CaseService` business logic, status transitions | Catch logic bugs without DB dependency |
| Backend Integration | Spring Boot Test + H2 | `CaseController` REST endpoints, auth filter | Verify full request→response cycle |
| Backend SQL | Spring Boot Test + PostgreSQL Testcontainers | Complex search queries | Ensure SQL correctness with real DB |
| Frontend Unit | Vitest + React Testing Library | Case list render, login form validation | Catch UI regressions |
| Frontend API Mock | MSW (Mock Service Worker) | API integration in components | Test UI without live backend |
| E2E (optional) | Playwright | Full login → create case → upload doc flow | Demonstrate end-to-end quality |

---

## 11. CI/CD Plan

**GitHub Actions pipeline** (`.github/workflows/ci.yml`):

```
Trigger: push or PR to main

Jobs:
1. backend-test
   - Checkout code
   - Set up Java 21
   - Run: ./mvnw test
   - Upload test report

2. frontend-test
   - Checkout code
   - Set up Node 20
   - Run: npm ci && npm test

3. docker-build (depends on both test jobs)
   - Build backend Docker image
   - Build frontend Docker image
   - Push to Docker Hub (on main only)

4. deploy (manual trigger or on tag)
   - Deploy to Railway / Render / AWS ECS
```

**Interview talking point:** "My pipeline enforces that no code reaches main without passing both backend and frontend tests. The Docker build job only runs after all tests pass — this gives confidence in every deployment."

---

## 12. Cloud Deployment Plan

### Option A — Railway (Simplest, free tier)
1. Connect GitHub repo to Railway
2. Add PostgreSQL plugin (auto-provision)
3. Set env vars: `JWT_SECRET`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `S3_BUCKET`
4. Railway auto-builds from Dockerfile on push

### Option B — AWS ECS (Closest to JD)
1. Push Docker images to Amazon ECR
2. Create ECS Fargate task definitions for API and frontend
3. Use RDS PostgreSQL for the database
4. Use real S3 bucket and SQS queue
5. ALB (Application Load Balancer) in front of ECS service
6. GitHub Actions deploy step: `aws ecs update-service`

**Interview talking point for Option B:** "The JD calls out EC2, ECS, Lambda, S3, and SQS — so I designed the deployment to use exactly those services. ECS Fargate runs the containerized API, S3 stores documents, and SQS decouples the notification flow with a Lambda consumer."

---

## 13. Interview Talking Points

### Project Elevator Pitch
"I built a full-stack bankruptcy case tracker — a mini version of what Stretto actually does. It has a Spring Boot REST API, a React TypeScript dashboard, PostgreSQL for case data, S3 for document storage, and SQS for async notifications. The whole thing runs locally with Docker Compose and deploys with a GitHub Actions pipeline."

### Backend
- "I used Spring Boot 3 with a layered architecture: Controller handles HTTP, Service owns business logic, Repository talks to the database via Spring Data JPA. This separation makes each layer independently testable."
- "Spring Security handles JWT authentication. Every protected endpoint validates the Bearer token in a filter before the request reaches the controller."
- "I used Flyway for database migrations — every schema change is versioned and reproducible, which is critical in a team environment."

### Frontend
- "React 18 with TypeScript gave me type safety across all API response shapes. I defined TypeScript interfaces for every API model, which caught several integration mismatches before runtime."
- "I used custom hooks to separate API concerns from UI logic — `useCases()` and `useCaseDetail()` are reusable and independently testable."

### Database
- "I wrote JPQL queries for case search with dynamic filters — status, date range, assignee — and a native SQL aggregation query for the dashboard summary counts. This demonstrates the complex SQL the JD specifically asks for."

### AWS / Cloud
- "Locally I used LocalStack to simulate S3 and SQS — same AWS SDK calls, same code, no cloud costs during development. In production you just swap the endpoint URL."
- "S3 pre-signed URLs let the frontend download documents directly from S3 without proxying through the API — better performance and less server load."
- "SQS decouples the notification concern from the API. If the Lambda consumer goes down, messages queue up and process when it recovers — no data loss."

### CI/CD
- "My GitHub Actions pipeline runs on every push. Backend tests, frontend tests, then Docker build — all gates must pass before the image is tagged and pushed. No manual steps."

### Security
- "JWT is stateless — no server-side session storage needed. I set a short expiry (15 minutes) with refresh token support planned. BCrypt hashes all passwords with a cost factor of 12."
- "I addressed OWASP Top 10: SQL injection is prevented by parameterized JPA queries, XSS is mitigated by React's default escaping, CORS is locked to the frontend origin, and secrets are in environment variables, never in code."

---

## 14. Save the Plan

This file IS the saved plan at `docs/jd-practice-plan.md`.

---

*Generated by analyze-jd-and-plan-project.prompt.md — Stretto Full Stack Engineer JD — May 2026*
