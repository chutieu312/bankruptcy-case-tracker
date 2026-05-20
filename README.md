# Bankruptcy Case Tracker

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.2 · Java 21 · Maven |
| Auth | Spring Security 6 · JWT (JJWT 0.12) |
| Database | PostgreSQL 15 · Flyway migrations |
| AWS | S3 (document storage) · SQS (async events) · LocalStack (local sim) |
| Lambda | Node.js 20 · SQS consumer |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Testing | JUnit 5 · Mockito · Vitest · React Testing Library |
| CI/CD | GitHub Actions |
| Containers | Docker · docker-compose |

---

## Quick Start (Docker)

> **New to this project? Start here.** Everything runs in Docker — no Java, Maven, or PostgreSQL needed on your machine.

### Prerequisites

Install these once if you don't have them:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes `docker compose`)
- [Node.js 20+](https://nodejs.org/) (only needed to generate the frontend lockfile — a one-time step)
- [Git](https://git-scm.com/)

### 1 — Push this project to your own GitHub repo

> **If you cloned from an existing remote**, skip this step.

If you have the project locally and want to push it to a new GitHub repo:

**a) Create a new empty repository on GitHub**
- Go to https://github.com/new
- Name it `bankruptcy-case-tracker`
- Leave it **empty** (no README, no .gitignore)
- Click **Create repository**

**b) Initialize git and push**

```bash
cd bankruptcy-case-tracker

git init
git add .
git commit -m "Initial commit"

# Replace the URL with your own repo URL from GitHub
git remote add origin https://github.com/<your-username>/bankruptcy-case-tracker.git
git branch -M main
git push -u origin main
```

GitHub will prompt for your credentials the first time. If you use HTTPS, create a [Personal Access Token](https://github.com/settings/tokens) and use it as the password.

### 2 — Generate the frontend lockfile (first-time clone only)

Docker uses `npm ci` which requires a `package-lock.json`. This file is already committed to the repo, so **you only need this step if `frontend/package-lock.json` is missing**:

```bash
cd frontend
npm install
cd ..
```

### 3 — Build and start all services

```bash
docker compose up --build
```

This builds and starts four containers:

| Container | What it does | Port |
|---|---|---|
| `postgres` | PostgreSQL 15 database | 5432 |
| `localstack` | Local AWS S3 + SQS simulator | 4566 |
| `api` | Spring Boot REST API | 8080 |
| `frontend` | React app served by nginx | **3000** |

The first build downloads Maven and npm dependencies (~3–5 min). Subsequent starts use the cache and take ~30 seconds.

### 4 — Open the app

Once you see `Started BankruptcyTrackerApplication` in the logs, open:

**http://localhost:3000**

Log in with any demo account:

| Role | Email | Password |
|---|---|---|
| Admin | admin@strettodemo.com | demo1234 |
| Attorney | attorney@strettodemo.com | demo1234 |
| Trustee | trustee@strettodemo.com | demo1234 |

### 5 — Stop the app

```bash
# Stop containers (keeps your data)
docker compose down

# Stop and wipe all data (fresh start next time)
docker compose down -v
```

---

## Troubleshooting

**`npm ci` fails during build** — You skipped step 2. Run `cd frontend && npm install && cd ..` then rebuild.

**Port already in use** — Another service is on port 3000, 8080, or 5432. Stop it or change the port mapping in `docker-compose.yml`.

**Login returns 401** — The database may have stale data. Run `docker compose down -v && docker compose up --build` to reset everything.

**LocalStack unhealthy** — Wait 30 seconds for it to initialize, or run `docker compose restart localstack`.

---

## Local Dev (no Docker)

### Prerequisites
- Java 21, Maven 3.9+
- Node.js 20, npm
- PostgreSQL 15 running locally
- LocalStack (for AWS S3 + SQS simulation)

### 1 — Start LocalStack

```bash
pip install localstack awscli-local
localstack start -d
# Create resources
awslocal s3 mb s3://case-documents
awslocal sqs create-queue --queue-name case-notifications
```

### 2 — Start the backend

```bash
cd backend
export DB_HOST=localhost DB_PORT=5432 DB_NAME=casetracker DB_USER=postgres DB_PASSWORD=postgres
export JWT_SECRET=dev-secret-change-in-prod-minimum-32-chars
export AWS_REGION=us-east-1 AWS_ENDPOINT=http://localhost:4566
export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test
export S3_BUCKET=case-documents SQS_QUEUE_URL=http://localhost:4566/000000000000/case-notifications
mvn spring-boot:run
# API available at http://localhost:8080/api
```

### 3 — Start the frontend

```bash
cd frontend
npm install
npm run dev
# App at http://localhost:5173
```

---

## Running Tests

### Backend

### Frontend
```bash
cd frontend
npm run test
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Get JWT token |
| POST | /api/auth/register | Register new user |
| GET | /api/cases | Search/filter cases (paginated) |
| GET | /api/cases/summary | Status count aggregation |
| GET | /api/cases/:id | Get case detail |
| POST | /api/cases | Create case |
| PUT | /api/cases/:id | Update case |
| PATCH | /api/cases/:id/status | Update status (fires SQS event) |
| GET | /api/cases/:id/documents | List documents |
| POST | /api/cases/:id/documents | Upload document → S3 |
| GET | /api/cases/:caseId/documents/:id/download-url | Pre-signed S3 URL |
| DELETE | /api/cases/:caseId/documents/:id | Delete document |

---

## JD Skills Mapping

| Feature | Stretto JD Skill |
|---|---|
| Spring Boot REST API | Java / Spring Boot |
| JWT auth + Spring Security 6 | Security / authentication |
| Flyway migrations + PostgreSQL | Relational DB / schema management |
| Complex JPQL queries w/ pagination | SQL / query optimization |
| S3 document upload + pre-signed URLs | AWS S3 |
| SQS async event publishing | AWS SQS / event-driven architecture |
| Node.js Lambda SQS consumer | AWS Lambda / serverless |
| React + TypeScript + Tailwind | React / TypeScript / CSS |
| Vitest + React Testing Library | Frontend testing |
| JUnit 5 + Mockito | Backend unit testing |
| Docker multi-stage builds | Containerization |
| docker-compose multi-service | Local dev environment |
| GitHub Actions CI/CD | CI/CD pipelines |
