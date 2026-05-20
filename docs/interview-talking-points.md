# Interview Talking Points — Bankruptcy Case Tracker
### Target Role: Full Stack Software Engineer @ Stretto
### Source: `docs/jd-practice-plan.md` + actual workspace inspection

---

## 1. Project Summary

> **30-second version — say this out loud:**

"I built a full-stack bankruptcy case management application — directly inspired by Stretto's core domain. It's a web app where legal professionals can log in, search and filter bankruptcy cases, upload case documents to S3, and trigger async status-change notifications via SQS. The backend is Spring Boot 3 with Java 21, the frontend is React with TypeScript, and everything runs locally in Docker with LocalStack simulating AWS. I also wired up a GitHub Actions CI/CD pipeline and wrote unit and component tests. The goal was to cover every required skill on the Stretto JD in one runnable project."

---

## 2. Actual Tech Stack Found

| Area | Technology Found | Evidence From Workspace | Interview Explanation |
|---|---|---|---|
| Backend Language | Java 21 | `pom.xml` `<java.version>21</java.version>` | "Java 21 — latest LTS. I explicitly configured it in Maven to match JD requirement." |
| Backend Framework | Spring Boot 3.5.14 | `pom.xml` `spring-boot-starter-parent 3.5.14` | "Spring Boot 3 on Jakarta EE 10. Covers the JD's Spring Boot + Hibernate + Spring JPA requirements." |
| ORM | Hibernate 6 / Spring Data JPA | `pom.xml` `spring-boot-starter-data-jpa`; `@Entity` models | "Spring Data JPA with Hibernate 6 as the ORM. I used both repository methods and custom JPQL for complex queries." |
| Auth | Spring Security 6 + JJWT 0.12.5 | `pom.xml`; `SecurityConfig.java`; `JwtService.java` | "Stateless JWT auth — filter validates token on every request. BCrypt(12) for password hashing." |
| Database | PostgreSQL 15 | `docker-compose.yml`; `application.yml` datasource | "PostgreSQL 15 in Docker. Flyway manages schema migrations — 3 versioned migration scripts." |
| Schema Migrations | Flyway | `pom.xml` `flyway-core`; `db/migration/V1–V3` SQL files | "Three Flyway scripts: V1 creates schema, V2 seeds demo data, V3 fixes BCrypt hashes." |
| Frontend Framework | React 18.3.1 | `frontend/package.json` | "React 18 with functional components, hooks, and React Router v6 for SPA navigation." |
| Frontend Language | TypeScript 5.4.5 | `frontend/tsconfig.json`; `.tsx` source files | "Full TypeScript on the frontend — strict types for API responses, component props, and route params." |
| Frontend Build | Vite | `frontend/package.json` `vite 5.x` | "Vite for fast dev server and optimised production bundle." |
| Styling | Tailwind CSS 3.4.4 | `frontend/package.json`; `tailwind.config.js` | "Tailwind utility classes — responsive layout without custom CSS overhead." |
| HTTP Client | Axios 1.7.2 | `frontend/package.json`; `frontend/src/api/` | "Axios client with a base URL and JWT Authorization header injected via an interceptor." |
| AWS — S3 | AWS SDK v2 2.25.27 | `pom.xml`; `DocumentService.java` `s3Client.putObject` | "S3 for document storage. I also generate pre-signed GET URLs so the browser downloads directly from S3." |
| AWS — SQS | AWS SDK v2 | `pom.xml`; `NotificationService.java` `sqsClient.sendMessage` | "SQS for async event publishing on case status change — decouples the API from notification delivery." |
| AWS — Lambda | Node.js 20 | `lambda/handler.js` | "Node.js Lambda that consumes SQS messages — logs the notification, simulates SES email or webhook." |
| AWS Simulation | LocalStack 3.4 | `docker-compose.yml` `localstack/localstack:3.4` | "LocalStack runs S3 and SQS locally in Docker so I can develop offline without real AWS credentials." |
| Backend Tests | JUnit 5 + Mockito | `CaseServiceTest.java`; `CaseControllerTest.java` | "Unit tests with Mockito mocks for service layer; @WebMvcTest integration tests for controllers." |
| Frontend Tests | Vitest 1.6 + React Testing Library | `frontend/package.json`; `CasesPage.test.tsx` | "Vitest + RTL — I mock the Axios API module and assert that the UI renders the correct data." |
| CI/CD | GitHub Actions | `.github/workflows/ci.yml` | "Three jobs: backend-test (with a Postgres service container), frontend-test, docker-build on main." |
| Containers | Docker multi-stage + docker-compose | `backend/Dockerfile`; `frontend/Dockerfile`; `docker-compose.yml` | "Multi-stage Docker builds — Maven build stage produces a minimal JRE runtime image. Frontend: Node build → nginx." |
| AI Tooling | GitHub Copilot | Used throughout development | "GitHub Copilot — listed as a preferred tool in the JD. I used it for boilerplate, test scaffolding, and SQL query refinement." |

---

## 3. Main Features Implemented

| Feature | Files / Modules Involved | Skill Demonstrated | How To Explain It |
|---|---|---|---|
| JWT Authentication | `AuthController.java`, `JwtService.java`, `JwtAuthFilter.java`, `SecurityConfig.java` | Spring Security 6, stateless auth | "POST `/api/auth/login` validates credentials, returns a signed JWT. Every subsequent request passes the token in the Authorization header — the filter validates it before the request reaches any controller." |
| User Roles | `User.java` (Role enum: ADMIN/ATTORNEY/TRUSTEE), `SecurityConfig.java` | RBAC, Spring Security | "Three roles stored in the users table. Spring Security injects the principal on each request — controllers can use `@AuthenticationPrincipal` to get the current user." |
| Case CRUD | `CaseController.java`, `CaseService.java`, `CaseRepository.java`, `Case.java` | REST API, Spring Data JPA | "Full CRUD — GET list with filters, GET by ID, POST create, PUT update, PATCH status. Each operation goes through a service layer for business logic before hitting the repository." |
| Paginated Case Search | `CaseRepository.java` JPQL `searchCases()`, `CaseController.java` `Pageable` | Complex SQL, pagination | "I wrote a custom JPQL query with five optional filters (status, chapter, debtor name, date range). Spring's Pageable injects page/size/sort. The result is a Page<Case> with totalElements metadata." |
| Dashboard Summary | `CaseController.java` `GET /summary`, `CaseRepository.java` `countByStatus()` | SQL aggregation | "A single endpoint that returns a status→count map. On the frontend this drives the four summary cards at the top of the cases page." |
| Document Upload to S3 | `DocumentController.java`, `DocumentService.java`, `Document.java` | AWS S3, multipart upload | "The API receives a multipart file, generates a UUID-based S3 key, uploads the bytes via AWS SDK PutObject, then stores the metadata (filename, s3Key, size, contentType) in the documents table." |
| Pre-signed S3 Download | `DocumentService.java` `S3Presigner.presignGetObject()` | AWS S3 presigned URLs | "Instead of proxying the file through the API, I generate a pre-signed URL valid for 15 minutes. The frontend redirects the user directly to S3 — keeps the API stateless and offloads bandwidth." |
| Async SQS Notification | `NotificationService.java` `@Async sendCaseStatusChangeNotification()`, `CaseService.java` | AWS SQS, event-driven | "When `PATCH /cases/{id}/status` is called, the service publishes a JSON event to the SQS queue asynchronously (non-blocking). The Lambda consumer picks it up and processes the notification." |
| Lambda SQS Consumer | `lambda/handler.js` | Node.js, AWS Lambda, SQS | "An event-driven Lambda handler that iterates over the SQS batch, parses the event payload, and processes CASE_STATUS_CHANGED events. It handles partial batch failures gracefully." |
| Schema + Seed Data | `V1__initial_schema.sql`, `V2__seed_data.sql`, `V3__fix_demo_passwords.sql` | Flyway, SQL, DB management | "Flyway runs on startup and applies any pending migrations in version order. V1 creates three tables with indexes, V2 seeds three users and five cases, V3 corrects the BCrypt hashes." |
| Frontend Case List + Filters | `CasesPage.tsx`, `frontend/src/api/` | React, TypeScript, state management | "A React page that fires two parallel API calls — case search and status summary — on mount and on filter change. Filter state is managed with useState + useCallback to debounce re-fetches." |
| Case Detail + Status Change | `CaseDetailPage.tsx` | React, Axios, event-driven UI | "The case detail page shows all fields plus the document list. Changing the status dropdown calls PATCH `/status` which triggers the backend SQS notification in the background." |
| GitHub Actions Pipeline | `.github/workflows/ci.yml` | CI/CD, Docker, GitHub Actions | "Three-job pipeline: backend-test spins up a real Postgres service container and runs `mvn verify`; frontend-test runs `npm ci && npm run test`; docker-build runs on main to validate the Docker images." |
| Docker Compose Stack | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile` | Containerisation, local dev | "Four services in docker-compose: postgres, localstack, api, frontend. Health checks ensure postgres is ready before the API starts, and localstack is healthy before the API tries AWS calls." |

---

## 4. JD Skill Mapping

*(JD sourced from `docs/jd-practice-plan.md` — Stretto Full Stack Software Engineer)*

| JD Skill | What I Built | How To Explain It |
|---|---|---|
| **Java + Spring Boot** | Spring Boot 3.5 REST API — auth, cases, documents modules | "I built a layered Spring Boot 3 API: Controller → Service → Repository. Each module is its own package with clear separation of concerns." |
| **Hibernate + Spring JPA** | `Case`, `User`, `Document` entities; `CaseRepository` with custom JPQL | "I modelled three entities with one-to-many relationships (Case → Documents, User → Cases). I used Spring Data's derived queries for simple lookups and JPQL for complex filter searches." |
| **Node.js** | `lambda/handler.js` SQS consumer | "The Lambda consumer is Node.js 20 — lightweight and appropriate for an event-driven function that doesn't need the full JVM stack." |
| **TypeScript + ReactJS** | React 18 SPA with TypeScript interfaces, React Router v6 | "Full TypeScript frontend — I defined interfaces for Case, Document, Page<T>, and StatusSummary so the compiler catches API contract mismatches at build time." |
| **CSS / HTML** | Tailwind CSS 3.4, semantic HTML5 in JSX | "Tailwind utility classes for responsive layout. Status badges use dynamic class maps (e.g. OPEN→green, CLOSED→gray) computed from a TypeScript Record." |
| **AWS S3** | `DocumentService.java` — PutObject + presigned GetObject | "I upload files to S3 via the AWS SDK v2 and generate pre-signed URLs. This is the same pattern used in production for secure, time-limited document access." |
| **AWS SQS** | `NotificationService.java` — async SendMessage on status change | "SQS decouples the API from notification delivery. If the consumer is slow or down, messages queue up and get retried — no data loss, and the API doesn't block." |
| **AWS Lambda** | `lambda/handler.js` — SQS-triggered Node.js handler | "A serverless consumer that processes case status events. In production this would call SES for email or post to a webhook. I simulated the pattern using LocalStack." |
| **Complex SQL queries** | JPQL `searchCases()` with 5 filters + date range + pagination; `countByStatus()` aggregation | "The case search query uses dynamic WHERE clauses — each filter is optional. I also added five database indexes on the most common search columns to avoid full table scans." |
| **CI/CD pipelines** | GitHub Actions — backend-test → frontend-test → docker-build | "The pipeline enforces that no code reaches main without passing both backend and frontend tests. Docker build only runs after all tests pass." |
| **Security vulnerability remediation** | BCrypt(12), JWT 15-min expiry, CORS whitelist, `@Valid` Bean Validation, `@JsonIgnore` on sensitive fields | "I addressed several security concerns: short-lived JWTs, BCrypt with a high cost factor, CORS restricted to known origins, and input validation on all POST/PUT bodies." |
| **Agile / Scrum** | Phased build plan in `jd-practice-plan.md`, feature-branch + PR workflow | "I structured the project as eight phased sprints in the practice plan — each phase has a clear deliverable, mirroring how I'd work in a Scrum team." |
| **AI Tools (GitHub Copilot)** | Used throughout for boilerplate, test scaffolding, SQL queries | "GitHub Copilot is called out as a preferred tool in the JD. I used it to accelerate boilerplate generation and unit test scaffolding — same way it would be used on the team." |

---

## 5. Backend Talking Points

### API Design
"I followed a standard layered architecture: Controller → Service → Repository. The context path is `/api`, so all endpoints are under `/api/cases`, `/api/auth`, etc. Every controller method does nothing except call the service — no business logic leaks into controllers."

"Pagination uses Spring's `Pageable` — the client passes `?page=0&size=10&sort=filingDate,desc` and gets back a `Page<Case>` with `totalElements` and `totalPages` included. This is interview-ready because it shows I understand paging without rolling my own."

### Business Logic
"The most interesting business rule is the status change flow: when a user calls `PATCH /cases/{id}/status`, the service updates the record and then calls `NotificationService.sendCaseStatusChangeNotification()`. That method is `@Async` — it fires and forgets to SQS without blocking the HTTP response."

### Validation
"I use Spring's `@Valid` on every `@RequestBody`. The `CaseRequest` is a Java record with `@NotBlank`, `@NotNull`, and `@Min`/`@Max` annotations. If validation fails, Spring throws `MethodArgumentNotValidException` and my `GlobalExceptionHandler` catches it and returns a structured 400 with field-level error messages."

### Database Access
"For simple lookups I rely on Spring Data derived queries — `findById`, `findByEmail`. For the case search I wrote a JPQL query with five optional filters using `(:param IS NULL OR condition)` so unset filters are effectively skipped. Pagination and sorting are delegated to Hibernate, which generates efficient SQL with LIMIT/OFFSET."

**One gotcha I hit and fixed:** "Hibernate 6 with PostgreSQL can't infer the type of a null parameter — it sends it as `bytea`, which breaks `LOWER()`. I fixed it by casting the parameter: `CAST(:debtorName AS String)` in JPQL. That was a real Hibernate 6 + PostgreSQL interaction bug I debugged and resolved."

### Error Handling
"I have a `@RestControllerAdvice` global handler that maps exceptions to HTTP status codes: `EntityNotFoundException` → 404, `MethodArgumentNotValidException` → 400, `BadCredentialsException` → 401, everything else → 500. The 500 handler also logs the full stack trace, so silent errors don't happen."

### Performance Considerations
"I added five indexes in the V1 schema migration: `idx_cases_status`, `idx_cases_chapter`, `idx_cases_filing_date`, `idx_cases_assigned`, `idx_documents_case`. These cover the most common WHERE and JOIN columns. In production I'd use `EXPLAIN ANALYZE` to verify the query plan."

### Trade-offs Made for Simplicity
- "JWT tokens are stateless — there's no token blacklist, so logout just means deleting the token on the client. In production I'd add a Redis-backed token revocation store or use refresh + short-lived access tokens."
- "Lazy loading is enabled (default JPA behaviour). For the cases list I serialize only the case fields, not nested collections — I added `@JsonIgnore` on the `documents` field and `@JsonIgnoreProperties` on lazy-loaded User proxies to prevent `ByteBuddyInterceptor` serialization errors."
- "The API uses Tomcat's default thread pool — no explicit async servlet configuration. For heavy upload traffic I'd consider switching to virtual threads (Java 21) or a reactive stack."

---

## 6. Frontend Talking Points

### UI Structure
"The app has four pages: Login, Cases List, Case Detail, and a Register page. I used React Router v6's `<Routes>` for navigation and a context-based auth guard — unauthenticated users are redirected to `/login` automatically."

"The `CasesPage` has two sections: a summary row of four status cards at the top (driven by `GET /cases/summary`) and a filterable, paginated table below (driven by `GET /cases`). Both API calls fire in parallel using `Promise.all` to minimise latency."

### State Management
"I kept state management simple — `useState` and `useCallback` in each page component, no Redux or Zustand. The `useCallback` on the `load` function prevents infinite re-render loops when filter state or page number changes. For auth state I used a React Context (`AuthContext`) so any component can read the current user and token."

"If the app scaled to dozens of pages I'd introduce React Query — it gives caching, background refetch, and loading/error states out of the box without manual state boilerplate."

### API Integration
"I centralised all API calls in `frontend/src/api/`. The Axios instance has a request interceptor that reads the JWT from `localStorage` and injects the `Authorization: Bearer <token>` header automatically. This means no page component has to think about auth headers."

### User Experience
"Status badges use a `STATUS_COLORS` TypeScript Record — each status maps to a Tailwind class pair (e.g. `OPEN` → `bg-green-100 text-green-800`). Filtering is reactive — changing any filter or page triggers a new API call. Loading state shows a skeleton-style 'Loading…' indicator."

### Trade-offs Made for Simplicity
- "No React Query or SWR — I manage loading/error state manually with `useState`. Simple enough for this size, but I'd adopt React Query in production."
- "JWT stored in `localStorage` — convenient but vulnerable to XSS. In production I'd store the token in an httpOnly cookie."
- "No optimistic UI updates — status changes re-fetch the full page after success. Fine for demo, but a real app would update local state immediately and roll back on error."

---

## 7. Database Talking Points

### Schema Design
"Three tables: `users`, `cases`, `documents`. `cases` has a foreign key to `users` twice — `assigned_to_id` (the attorney handling the case) and `created_by_id` (audit trail). `documents` has a foreign key to `cases` with `ON DELETE CASCADE` — deleting a case removes all its documents automatically."

### Relationships
"It's a classic one-to-many: one case has many documents, one user can be assigned to many cases. In JPA I mapped these as `@ManyToOne` on the document side and `@OneToMany(mappedBy, fetch = LAZY)` on the case side. I kept all collections lazy to avoid N+1 queries on list endpoints."

### Queries
"The interesting query is `searchCases()` in `CaseRepository`. It's a JPQL query with five optional filters. Each condition is written as `(:param IS NULL OR entity.field = :param)` — if the caller passes `null`, the condition is always true and effectively skipped. This avoids building dynamic queries with Criteria API or string concatenation."

"The summary query `countByStatus()` uses a JPQL `GROUP BY` — it returns `List<Object[]>` which I convert to a `Map<String, Long>` in the service. That map goes straight to the frontend as JSON for the dashboard cards."

### Indexing
"Five indexes on the most-queried columns: `status`, `chapter`, `filing_date`, `assigned_to_id`, and `documents.case_id`. Without the `case_id` index, loading documents for a case would do a full table scan. The others speed up the WHERE clauses in the search query."

### Trade-offs
- "No full-text search — debtor name search uses SQL `LIKE '%name%'`, which can't use a B-tree index. For production I'd add a PostgreSQL GIN index with `pg_trgm` or move to Elasticsearch for full-text case search."
- "`updated_at` is set on insert and never auto-updated by the DB — I rely on Hibernate's `@PreUpdate`. In production I'd use a database trigger as a safety net."

### What I Would Improve for Production
1. Add `pg_trgm` GIN index on `debtor_name` for fast fuzzy search
2. Add read replicas — all list/search queries go to the replica, writes go to primary
3. Add connection pooling (HikariCP is already Spring Boot's default — I'd tune `maximumPoolSize` based on load testing)
4. Partition `cases` by `filing_date` for historical data archival

---

## 8. Cloud Talking Points

### Services Used / Simulated
"I use three AWS services: S3 for document storage, SQS for async notifications, and Lambda (simulated) as the SQS consumer. All three run locally via LocalStack 3.4 in Docker — same API surface as real AWS, so switching to a real AWS account is just an environment variable change (swap the endpoint from `http://localstack:4566` to nothing, and provide real credentials)."

### Why These Services Make Sense
- **S3**: "Case documents — PDFs, spreadsheets — don't belong in a relational database. S3 is infinitely scalable, durable, and cheap. Pre-signed URLs mean the API never proxies file bytes — S3 handles the download directly."
- **SQS**: "Status change notifications are a natural fit for a queue. The API doesn't need to know who's consuming the event — it just publishes to the queue. This decouples the API from email sending, webhook delivery, or audit logging. If the consumer is down, messages are retained and retried."
- **Lambda**: "A serverless consumer is perfect here — the workload is bursty (events happen when cases change), not continuous. Lambda scales to zero when idle and scales out automatically under load."

### How This Maps to the JD
"The Stretto JD calls out EC2, ECS, Lambda, S3, and SQS specifically. I've covered S3, SQS, and Lambda directly. For EC2/ECS — that's the deployment target. I'd containerise the Spring Boot API (already done) and push it to ECR, then deploy to ECS Fargate. The GitHub Actions pipeline is already structured to support that."

### What I Would Improve for Production
1. Use IAM roles instead of static `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` — ECS tasks get instance role credentials automatically
2. Enable SQS Dead Letter Queue — messages that fail 3 times go to a DLQ for investigation
3. Set S3 bucket policy to deny public access + enable SSE-S3 encryption at rest
4. Use AWS Secrets Manager for DB credentials instead of environment variables
5. Deploy Lambda to real AWS with a proper SQS event source mapping

---

## 9. CI/CD Talking Points

### Build
"The GitHub Actions workflow triggers on push to `main` or `develop`, and on PRs targeting `main`. The first job, `backend-test`, uses `actions/setup-java@v4` with `distribution: temurin` and caches Maven dependencies to speed up repeated runs. It runs `mvn verify -q` which compiles, runs tests, and checks the package."

### Test
"Backend tests run against a real Postgres 15 container — not H2. I use GitHub Actions' `services` block to spin up a Postgres service container alongside the job. This means the tests exercise real PostgreSQL query behaviour, including the Hibernate 6 / JPQL quirks I hit in development."

"Frontend tests run `npm ci` (uses the committed `package-lock.json` for deterministic installs) then `npm run test` which runs Vitest in CI mode."

### Docker Image
"The `docker-build` job depends on both test jobs passing — it only runs on pushes to `main`. It builds both the backend and frontend Docker images to validate that the multi-stage builds complete without error. In a production extension I'd add a `docker push` step to push to ECR or Docker Hub."

### Deployment
"The pipeline doesn't deploy automatically in the current setup — that's a deliberate simplification. The logical next step would be a `deploy` job triggered on tags or manual dispatch that pushes images to ECR and updates an ECS service definition."

### Rollback / Safety Checks
"The dependency chain is the safety gate: tests must pass before Docker builds, and Docker builds would gate deployments. For rollback, ECS supports rolling deployment with a previous task definition — you can roll back by re-registering the previous task definition revision."

### What This Demonstrates for Interview
"This pipeline shows I understand the three pillars of CI/CD: automated verification (tests), artefact creation (Docker images), and deployment automation. The postgres service container in the backend-test job is a detail most candidates miss — it shows I know the difference between unit tests with mocks and integration tests against a real database."

---

## 10. Testing Talking Points

### Unit Tests (`CaseServiceTest.java`)
"I tested `CaseService` in isolation using Mockito. I mocked `CaseRepository`, `UserRepository`, and `NotificationService`, then injected them with `@InjectMocks`. Three key tests:
1. `create_shouldSaveCaseWithOpenStatus` — verifies new cases always start as OPEN
2. `getById_whenNotFound_shouldThrow` — verifies 404 behavior
3. `updateStatus_shouldPublishSqsNotification` — verifies the SQS `sendCaseStatusChangeNotification` is called with the correct old/new status"

### Integration Tests (`CaseControllerTest.java`)
"I used `@WebMvcTest` to test the controller layer with a mocked `CaseService`. This validates that the HTTP routing, request mapping, and response serialization work correctly — without starting a full Spring context or hitting a database."

### Frontend Tests (`CasesPage.test.tsx`)
"I used Vitest with React Testing Library. I mocked the entire `@/api` module with `vi.mock()` so no real HTTP calls are made. The test renders `CasesPage` inside a `MemoryRouter`, resolves the mocked API promises, and asserts that the case data and status summary cards appear in the DOM."

### What Risks the Tests Cover
- Service-layer business logic bugs (wrong status on create, missing SQS call)
- Controller routing / HTTP method mismatches
- UI rendering with real async data loading
- TypeScript type contract between API responses and UI components

### What Additional Tests I Would Add in Production
1. **Testcontainers**: Spin up a real PostgreSQL container in CI and run the JPQL search query end-to-end — verifies the Hibernate 6 / PostgreSQL type inference fix I made
2. **Spring Boot `@SpringBootTest`** with full context for auth filter integration testing
3. **MSW (Mock Service Worker)**: Frontend API mocking at the network level — more realistic than mocking the Axios module
4. **Playwright E2E**: Login → create case → upload document → change status → verify SQS message logged
5. **Security tests**: Verify that unauthenticated requests to `/cases` return 401, and ROLE-restricted endpoints return 403

---

## 11. Security Talking Points

### Authentication
"I implemented JWT-based stateless authentication using JJWT 0.12.5 with HMAC-SHA256 signing. The secret key is injected from an environment variable — never hardcoded. Tokens expire in 15 minutes (`expiration-ms: 900000`). The JWT filter intercepts every request, extracts the token from the `Authorization: Bearer` header, validates the signature and expiry, and sets the `SecurityContext`."

### Authorization
"Spring Security's `SecurityConfig` defines the authorization rules: `/auth/login`, `/auth/register`, and `/actuator/health` are public. Everything else requires authentication. The three roles (ADMIN, ATTORNEY, TRUSTEE) are stored in the `users` table and loaded by `UserDetailsService` — they're available for `@PreAuthorize` annotations if role-based access control needs to be tightened."

### Input Validation
"Every `@RequestBody` is annotated with `@Valid`. The `CaseRequest` record uses Jakarta Validation annotations — `@NotBlank` on required strings, `@NotNull` on dates, and `@Min`/`@Max` on chapter numbers. Invalid input returns a structured 400 response with per-field error messages — no raw exception stack traces leak to the client."

### Secrets Management
"In the current Docker Compose setup, secrets (JWT secret, DB password, AWS credentials) are passed as environment variables. For production I'd use AWS Secrets Manager or HashiCorp Vault — the app would load secrets at startup via Spring Cloud Vault or the AWS SDK, not from environment variables baked into a task definition."

### CORS / API Security
"The `SecurityConfig` configures CORS to allow only `localhost:5173` (dev) and `localhost:3000` (Docker). In production this would be the specific frontend domain. All preflight OPTIONS requests are permitted by the CORS config."

### Production Improvements
1. Move JWT to httpOnly cookies to prevent XSS token theft
2. Add refresh token rotation — short-lived access tokens, longer-lived refresh tokens stored server-side
3. Add rate limiting on `/auth/login` to prevent brute force (Spring Cloud Gateway or a servlet filter)
4. Enable Spring Security's CSRF protection for cookie-based auth
5. Add `Content-Security-Policy` and `X-Content-Type-Options` response headers
6. Use IAM roles instead of static AWS credentials in production ECS deployment

---

## 12. System Design Explanation

> **Say this out loud as an architecture walkthrough:**

"Let me walk you through the full flow.

**User flow:** A legal professional opens the browser, hits `localhost:3000`. nginx serves the static React bundle. The login form posts to `/api/auth/login` — if credentials are valid, Spring Security and `JwtService` return a signed JWT. The React app stores it in localStorage and injects it into every Axios request from then on.

**Frontend flow:** `CasesPage` loads and fires two parallel requests — `GET /api/cases` for the paginated list and `GET /api/cases/summary` for the dashboard counts. The page renders both when both resolve. Filter changes trigger a new set of requests automatically. The detail page adds a third request — `GET /api/cases/{id}` — and a fourth for the document list.

**Backend flow:** Every request hits the `JwtAuthFilter` first. It extracts the token, validates the signature and expiry, and populates the Spring Security context. The request then routes to the appropriate controller, goes through the service layer where business rules live, and down to Spring Data JPA repositories which generate SQL and execute it against PostgreSQL.

**Database flow:** Flyway has already applied three migration scripts on startup — schema, seed data, and a password fix. The JPQL `searchCases()` query hits indexes on `status`, `chapter`, and `filing_date`. Hibernate translates it to parameterized SQL — no string interpolation, so no SQL injection risk.

**Cloud / async flow:** When a user changes a case status via `PATCH /cases/{id}/status`, the service saves the record to PostgreSQL and then calls `NotificationService.sendCaseStatusChangeNotification()` — which is `@Async` so it runs in a separate thread pool and doesn't block the HTTP response. It publishes a JSON message to the SQS queue. The Node.js Lambda consumer reads the message and processes the notification — currently it logs it, but in production it would call SES to send an email.

**Deployment flow:** GitHub Actions runs on every push to main. Backend tests run against a real Postgres service container. Frontend tests run against mocked APIs with Vitest. If both pass, the Docker images are built. To deploy to production I'd push the images to ECR and update an ECS Fargate service definition — or use Railway for a simpler PaaS deployment.

**Bottlenecks:** The most likely bottleneck under load is the case search query — it's a full table scan on `debtor_name` because SQL `LIKE '%pattern%'` can't use a B-tree index. I'd fix that with a PostgreSQL GIN index using `pg_trgm`, or move to Elasticsearch for full-text search.

**Scalability:** The backend is stateless — JWT means no server-side session, so I can run multiple API replicas behind a load balancer without sticky sessions. S3 and SQS are already horizontally scalable by nature. The main scaling challenge is PostgreSQL — I'd add read replicas for search traffic and use HikariCP tuning to manage connection pool size."

---

## 13. Behavioral Story (STAR Format)

> **Situation:**
"I was preparing for a Full Stack Software Engineer interview at Stretto, a legal-tech company that builds enterprise tools for the bankruptcy ecosystem. The job description listed a long set of technical requirements — Java, Spring Boot, React, TypeScript, AWS S3, SQS, Lambda, CI/CD pipelines, and security — and I wanted to be able to speak concretely to every one of them, not just theoretically."

> **Task:**
"I decided to build a portfolio project from scratch that covered as many JD skills as possible in a single end-to-end application. The goal wasn't a production system — it was a working, runnable demo I could walk an interviewer through and answer detailed questions about."

> **Action:**
"I planned an eight-phase build: backend foundation, database migrations, React frontend, AWS integrations, Docker containerisation, testing, CI/CD, and documentation. I used GitHub Copilot to accelerate boilerplate but wrote all the business logic and made all architectural decisions myself. The most interesting technical problems I solved were: a Hibernate 6 + PostgreSQL `lower(bytea)` type inference bug that required a JPQL `CAST` fix; Hibernate lazy proxy serialization errors that I resolved with `@JsonIgnoreProperties`; and a LocalStack health check incompatibility where version 3.4 reports `running` instead of `available` — I fixed the Docker Compose grep pattern. I wrote unit tests for the service layer, a WebMvcTest for the controller, and a Vitest + RTL component test for the cases page."

> **Result:**
"The project runs end-to-end with `docker compose up --build` — login works, five seeded cases load, documents upload to LocalStack S3, status changes publish to SQS, and the GitHub Actions pipeline passes on every push. More importantly, I now have concrete, specific answers for every technical question the interviewer might ask — from 'how does your JWT filter work' to 'walk me through your CI/CD pipeline' to 'what would you change for production'. The project is pushed to GitHub at github.com/chutieu312/bankruptcy-case-tracker."

---

## 14. Mock Interview Questions

---

**Q1: Walk me through your Spring Boot API architecture.**

> **Strong answer:** "I used a three-layer architecture: Controller, Service, Repository. Controllers handle HTTP routing and input/output mapping only — no business logic. Services contain all business rules, including the SQS notification on status change. Repositories extend `JpaRepository` and add custom JPQL for the complex search query. The context path is `/api` so all routes are namespaced. I also have a `GlobalExceptionHandler` annotated with `@RestControllerAdvice` that maps exceptions to appropriate HTTP status codes — 400 for validation, 404 for not found, 401 for auth failures, 500 for everything else."

> **What they're testing:** Layered architecture knowledge, separation of concerns.

> **Follow-up:** "How would you handle a use case that requires calling two different services — do you do that in the controller or the service?"

---

**Q2: How does your JWT authentication work end-to-end?**

> **Strong answer:** "The client POSTs credentials to `/api/auth/login`. Spring Security's `AuthenticationManager` delegates to `DaoAuthenticationProvider`, which loads the user by email from the database and verifies the BCrypt hash. On success, `JwtService.generateToken()` creates a signed JWT using HMAC-SHA256 with a secret key from an environment variable. The token is returned in the response body. On subsequent requests, the `JwtAuthFilter` extends `OncePerRequestFilter` — it reads the `Authorization: Bearer` header, extracts and validates the token, loads the `UserDetails`, and populates the `SecurityContextHolder`. The filter chain then allows the request to proceed to the controller."

> **What they're testing:** Depth of Spring Security understanding, stateless auth concepts.

> **Follow-up:** "What happens when the token expires? How does the user get a new one?"

---

**Q3: Explain your database schema and the relationships.**

> **Strong answer:** "Three tables: `users`, `cases`, and `documents`. Cases have two foreign keys to users — `assigned_to_id` for the attorney responsible for the case, and `created_by_id` for audit. Documents have a foreign key to cases with `ON DELETE CASCADE`, so deleting a case cleans up its documents automatically. In JPA I modelled these as `@ManyToOne` with `fetch = LAZY` to avoid N+1 problems on list queries. I added five indexes covering the most common WHERE columns: status, chapter, filing_date, assigned_to, and documents.case_id."

> **What they're testing:** Relational DB design, understanding of JPA lazy loading and N+1.

> **Follow-up:** "Have you used Hibernate's second-level cache? When would you use it here?"

---

**Q4: How does your S3 document upload work?**

> **Strong answer:** "The frontend sends a multipart form POST to `/api/cases/{id}/documents`. The controller passes the `MultipartFile` to `DocumentService.upload()`. The service generates a unique S3 key in the format `cases/{caseId}/{uuid}_{originalFilename}`. It calls `s3Client.putObject()` with the bucket name, key, content type, and the file bytes as a `RequestBody`. Then it saves a `Document` record to PostgreSQL with the S3 key, filename, size, and content type — the actual file lives in S3, the metadata lives in the database. For downloads, `S3Presigner.presignGetObject()` generates a URL valid for 15 minutes. The client redirects to that URL directly — the API never proxies the file bytes."

> **What they're testing:** AWS S3 SDK knowledge, presigned URL pattern, separation of file storage from metadata.

> **Follow-up:** "What would you do if the S3 upload succeeds but the database insert fails?"

---

**Q5: Why did you use SQS for status change notifications instead of calling a notification service directly?**

> **Strong answer:** "Three reasons. First, decoupling — the API doesn't need to know how notifications are delivered. Today it's a log message; tomorrow it could be SES email, an SNS push, or a webhook — the API code doesn't change. Second, resilience — if the consumer is temporarily down, messages queue up and get retried when it recovers. No notification is lost. Third, throughput — the status change API response returns immediately without waiting for the notification to be delivered. The `@Async` annotation on `sendCaseStatusChangeNotification` means it runs in a separate thread pool and doesn't add latency to the HTTP response."

> **What they're testing:** Event-driven architecture understanding, async vs sync trade-offs.

> **Follow-up:** "How would you handle a case where the SQS message is processed twice — what's your idempotency strategy?"

---

**Q6: Walk me through your CI/CD pipeline.**

> **Strong answer:** "GitHub Actions, three jobs. Job one: `backend-test` — uses `actions/setup-java@v4` with Temurin distribution and Maven cache. Critically, it spins up a real PostgreSQL 15 service container using the `services` block, not an in-memory H2 database. It runs `mvn verify` which compiles and runs all tests. Job two: `frontend-test` — installs with `npm ci` from the committed lockfile for deterministic installs, then runs Vitest. Job three: `docker-build` — depends on both test jobs, only runs on pushes to main, builds both Docker images to validate the multi-stage builds. The next step would be pushing to ECR and deploying to ECS."

> **What they're testing:** Practical CI/CD knowledge, understanding of service containers in Actions.

> **Follow-up:** "How would you add a rollback mechanism if the production deployment fails?"

---

**Q7: What security risks did you consider in this project?**

> **Strong answer:** "Several. JWT secret in environment variable — never hardcoded. Short token expiry of 15 minutes to limit the damage from a stolen token. BCrypt with cost factor 12 for password hashing — high enough to be slow against brute force. Input validation with Jakarta Validation on all request bodies — prevents garbage data and reduces injection surface. CORS restricted to known origins. `@JsonIgnore` on sensitive fields in serialized responses — the password hash is never returned to the client. I'm aware of what I didn't implement for simplicity: no token revocation, JWT in localStorage (XSS risk), no rate limiting on login. In production I'd fix those."

> **What they're testing:** Security awareness, ability to identify trade-offs honestly.

> **Follow-up:** "How would you prevent someone from accessing another user's documents?"

---

**Q8: How did you handle errors in your React frontend?**

> **Strong answer:** "Currently I have a try/finally pattern in the data-loading hooks — `setLoading(true)` before the API calls and `setLoading(false)` in the finally block regardless of success or failure. For errors I display a generic message. This is a known gap — I didn't implement a full error boundary or a toast notification system. In production I'd use React Error Boundaries for unexpected rendering errors and a library like `react-hot-toast` for API error feedback, combined with Axios response interceptors to handle 401s globally by clearing the auth context and redirecting to login."

> **What they're testing:** Honest self-assessment, understanding of production-grade error handling.

> **Follow-up:** "How would you handle a 401 response in the middle of a user session — for example, when the JWT expires?"

---

**Q9: What would you change about this project for a real production deployment?**

> **Strong answer:** "Five things immediately. One: swap LocalStack for real AWS — update the endpoint configuration, use IAM roles instead of static credentials. Two: move JWT to httpOnly cookies to prevent XSS token theft. Three: add a Redis-backed token revocation store or implement refresh token rotation. Four: replace the `LIKE '%name%'` debtor name search with a PostgreSQL GIN index on `pg_trgm` or Elasticsearch for full-text search at scale. Five: add an SQS Dead Letter Queue with an alarm — failed messages shouldn't silently disappear. I'd also add Terraform or AWS CDK to manage the infrastructure as code."

> **What they're testing:** Production readiness thinking, awareness of the gap between demo and production.

> **Follow-up:** "How would you manage database migrations in a blue-green deployment?"

---

**Q10: You mentioned Hibernate 6 and a type inference bug — can you explain that?**

> **Strong answer:** "Yes — this was a real bug I hit and debugged. In the `CaseRepository` JPQL search query, one of the optional filter parameters is `:debtorName`. When the caller passes `null`, Hibernate 6 can't infer the SQL type of the null value and sends it as `bytea` — a PostgreSQL binary type. The `LOWER()` function doesn't accept `bytea`, so the query threw a `PSQLException: function lower(bytea) does not exist`. The fix was to add an explicit CAST in the JPQL: `LOWER(CONCAT('%', CAST(:debtorName AS String), '%'))`. The `CAST(...AS String)` tells Hibernate to treat the parameter as a `VARCHAR`, which PostgreSQL's `LOWER()` is happy with. It's a Hibernate 6 regression — Hibernate 5 handled this automatically."

> **What they're testing:** Real debugging experience, depth of ORM knowledge.

> **Follow-up:** "Have you looked at what SQL Hibernate actually generated? How would you capture that in production logs?"

---

## 15. 60-Second Final Pitch

> **Rehearse this as a natural, confident close:**

"To tie everything back to the Stretto role — I built this project specifically to demonstrate the full-stack skill set your JD asks for, end to end.

On the backend: Spring Boot 3 with Java 21, Spring Security with JWT, Spring Data JPA with Hibernate, and a PostgreSQL schema managed by Flyway migrations. I wrote a complex JPQL query for paginated case search with five optional filters — and I debugged a real Hibernate 6 / PostgreSQL type inference bug in the process.

On the frontend: React 18 with TypeScript, Vite, and Tailwind. Type-safe API integration with Axios, React Router v6, and React Context for auth state.

On AWS: S3 for document storage with pre-signed URLs, SQS for async status-change notifications, and a Node.js Lambda consumer — all simulated locally with LocalStack so the dev experience is fast and offline.

On quality: GitHub Actions pipeline with backend tests against a real Postgres container and Vitest component tests on the frontend. Docker multi-stage builds and a full docker-compose local stack.

This project runs end to end. I can demo it, explain every architectural decision, and speak concretely about every trade-off I made. That's exactly the kind of ownership the role description talks about — from concept to deployment."

---

## 16. Weak Areas / Gaps

| Gap | Why It Matters | How To Explain It Honestly | How To Improve It |
|---|---|---|---|
| No real AWS deployment | JD mentions EC2, ECS — LocalStack simulates, not proves | "I deliberately kept the project local to focus on the code patterns. I'm familiar with ECS deployment — the Docker image is already built; the next step is pushing to ECR and creating a Fargate task definition." | Add a GitHub Actions `deploy` job that pushes to ECR and calls `aws ecs update-service` |
| JWT in localStorage (XSS risk) | Security best practice is httpOnly cookies | "I chose localStorage for simplicity in this demo. In a production app I'd use httpOnly cookies with a CSRF token to prevent both XSS token theft and CSRF attacks." | Refactor Axios interceptor to use cookies; add CSRF token handling |
| No token revocation / refresh flow | 15-min tokens expire but can't be invalidated early | "I have short-lived tokens as a partial mitigation. Full revocation requires a server-side store like Redis." | Implement refresh token rotation; add a Redis token blacklist |
| No SQS Dead Letter Queue | Failed SQS messages silently disappear after max retries | "I know this is a production gap. The fix is a one-line addition to the queue config." | Add DLQ + CloudWatch alarm on DLQ depth |
| Debtor name search uses LIKE '%x%' | Full-scan on large tables; can't use a B-tree index | "I acknowledged this in the index design. It's acceptable at small scale." | Add `pg_trgm` GIN index or introduce Elasticsearch |
| No refresh token in auth flow | After 15 min the user is hard-logged-out | "Deliberate simplification. The demo credential sessions are short enough that this doesn't matter for the demo." | Implement refresh token endpoint + sliding session |
| No Terraform / CDK | JD implies infra-as-code skills | "I described the deployment architecture but didn't write the IaC. I'd add Terraform modules for ECS, RDS, S3, SQS in a follow-up." | Add `infra/` Terraform module with ECS Fargate + RDS + SQS |
| No E2E tests (Playwright) | End-to-end tests catch integration gaps unit/component tests miss | "I covered unit and component tests. Playwright E2E tests would be the next testing layer." | Add `tests/e2e/` Playwright suite covering login → create case → upload → status change |
| Angular not practiced | JD lists Angular as an alternative to React | "I chose React because it's listed first and more widely used. The component model and TypeScript integration are conceptually similar." | Build a small Angular version of the login + cases list if specifically needed |
| Python not covered | JD lists Python as preferred | "The JD marks Python as preferred, not required. I focused on the required skills. I'm comfortable with Python for scripting and data tasks." | Add a Python `scripts/` folder with a Boto3 S3/SQS utility script |

---

## 17. Final Interview Cheat Sheet

> **Quick-review before you walk into the room:**

### 5 Strongest Talking Points
1. **End-to-end full stack** — React + TypeScript frontend, Spring Boot API, PostgreSQL, S3/SQS/Lambda, Docker, GitHub Actions CI/CD — the whole Stretto JD in one runnable project
2. **Real bug I debugged** — Hibernate 6 + PostgreSQL `lower(bytea)` type inference error; fixed with `CAST(:debtorName AS String)` in JPQL
3. **Async event-driven architecture** — SQS decouples status change notification from API response; `@Async` ensures no latency added to the HTTP flow
4. **Production-aware trade-offs** — I can name what I simplified (JWT in localStorage, no token revocation, no DLQ) and explain how I'd fix each one
5. **GitHub Actions with real Postgres** — backend tests run against a Postgres service container in CI, not H2 — demonstrates understanding of integration-level testing

### 5 Technical Terms to Mention
1. **Spring Data JPA / Hibernate 6** — ORM, entity relationships, lazy loading, JPQL
2. **Stateless JWT / Bearer token** — `JwtAuthFilter`, `OncePerRequestFilter`, `SecurityContextHolder`
3. **S3 Pre-signed URL** — `S3Presigner`, time-limited, direct browser-to-S3 download
4. **SQS + Lambda event-driven decoupling** — `@Async`, partial batch failure handling, Dead Letter Queue (gap)
5. **Flyway schema migration** — versioned SQL scripts, V1/V2/V3, `ddl-auto: validate`

### 5 Trade-offs to Explain
1. **Stateless JWT vs. server-side sessions** — chose stateless for horizontal scalability; trade-off is no instant revocation
2. **LIKE '%name%' search vs. full-text index** — chose simplicity; trade-off is full table scan on large data sets
3. **Lazy loading vs. eager fetching** — chose lazy to avoid N+1 on list endpoints; trade-off is needing `@JsonIgnore` to prevent proxy serialization errors
4. **LocalStack vs. real AWS** — chose LocalStack for offline dev speed; trade-off is can't prove real IAM / VPC behavior
5. **Single-tenant JWT in localStorage vs. httpOnly cookie** — chose localStorage for demo simplicity; trade-off is XSS vulnerability

### 5 Likely Follow-up Questions
1. "What happens when the JWT expires mid-session?"
2. "How would you scale the API to handle 10,000 concurrent users?"
3. "How would you prevent one user from seeing another user's documents?"
4. "What would you change if you had to deploy this to AWS ECS today?"
5. "How does your JPQL query perform with a million cases in the database?"

### 5 Concise Answers
1. **JWT expiry** — "Currently the user is logged out. To fix it I'd implement refresh token rotation — a long-lived refresh token stored in an httpOnly cookie that silently exchanges for a new access token."
2. **Scale to 10K concurrent users** — "The API is already stateless — run multiple replicas behind a load balancer. Add PostgreSQL read replicas for search traffic. Tune HikariCP pool size based on load testing. Consider virtual threads (Java 21) or reactive stack for very high concurrency."
3. **Document access control** — "Add a `SELECT` on the document + case + assigned_user relationship before generating the pre-signed URL. If the requesting user isn't the assignee or an admin, return 403."
4. **Deploy to ECS today** — "Push both Docker images to ECR, create ECS Fargate task definitions with the same environment variables currently in docker-compose.yml, add an ALB, point the frontend nginx to the ALB URL. Use AWS Secrets Manager for DB credentials and JWT secret."
5. **JPQL at 1M rows** — "The status, chapter, and filing_date indexes are already in place. The debtor name LIKE search would degrade — I'd add a `pg_trgm` GIN index or introduce Elasticsearch. I'd also add query result caching for the `/cases/summary` aggregation since it doesn't need to be real-time."
