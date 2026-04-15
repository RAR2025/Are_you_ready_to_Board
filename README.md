# Onboard AI

AI-powered developer onboarding platform for engineering teams.

Onboard AI helps companies convert scattered docs, policies, architecture notes, and repository context into a guided onboarding experience for new developers. The platform combines a web app, an API backend, and specialized Python agents for knowledge retrieval, onboarding planning, and adaptive quiz assessment.

## Table of Contents

1. [Project Vision](#project-vision)
2. [Core Use Cases](#core-use-cases)
3. [Architecture Overview](#architecture-overview)
4. [Monorepo Structure](#monorepo-structure)
5. [Service Responsibilities](#service-responsibilities)
6. [Data and Integration Model](#data-and-integration-model)
7. [Request Flow by Role](#request-flow-by-role)
8. [Local Development Setup](#local-development-setup)
9. [Environment Variables](#environment-variables)
10. [Build, Test, and Quality Gates](#build-test-and-quality-gates)
11. [Deployment and Infrastructure](#deployment-and-infrastructure)
12. [Security and Compliance Notes](#security-and-compliance-notes)
13. [Contribution Guidelines](#contribution-guidelines)
14. [Troubleshooting](#troubleshooting)
15. [Roadmap Ideas](#roadmap-ideas)

## Project Vision

New developers are usually productive in programming languages but blocked by company-specific systems: internal architecture, source control conventions, setup steps, access paths, team process, and security constraints.

Onboard AI provides:

- Company-aware, doc-grounded assistant responses.
- Personalized onboarding checklists by role and experience.
- Structured progress visibility for HR and engineering leads.
- Intelligent starter-task and quiz workflows to validate readiness.

## Core Use Cases

- System Designer creates an organization profile, uploads docs, and links repositories.
- HR monitors employee onboarding status across teams.
- Employee receives guided steps, context-aware chat answers, and role-specific checklists.
- Engineering manager tracks readiness signals before assigning production-critical work.

## Architecture Overview

The system is split into three layers:

- Interface Layer: React web app in apps/web.
- Orchestration Layer: Express API in apps/api with auth, business rules, queues, and agent proxying.
- Intelligence Layer: Python FastAPI agents in agents/ for RAG, onboarding plan generation, and quiz/statistics.

High-level flow:

1. User interacts with the web app.
2. API authenticates user and authorizes by role.
3. API route executes business logic and optionally dispatches jobs.
4. For AI workflows, API forwards to relevant Python agent.
5. Agent returns grounded output; API stores and returns normalized response.

## Monorepo Structure

```text
onboard-ai/
├── apps/
│   ├── web/                        # React frontend (Vite + React 18)
│   │   ├── src/
│   │   │   ├── app/                # Root layout, router, providers
│   │   │   ├── features/
│   │   │   │   ├── auth/           # Login, signup, role routing
│   │   │   │   ├── org/            # System designer dashboard
│   │   │   │   ├── hr/             # HR portal views
│   │   │   │   ├── employee/       # Employee onboarding + chat
│   │   │   │   └── code-graph/     # 3D repo visualization
│   │   │   ├── components/         # Shared UI components
│   │   │   ├── hooks/              # Shared hooks
│   │   │   ├── lib/                # API client, firebase init
│   │   │   └── stores/             # Zustand global state
│   │   └── package.json
│   │
│   └── api/                        # Express.js backend (Node 20)
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── org.ts
│       │   │   ├── hr.ts
│       │   │   ├── employee.ts
│       │   │   └── agent-proxy.ts  # Forwards to Python agents
│       │   ├── middleware/
│       │   │   ├── authenticate.ts
│       │   │   ├── authorize.ts    # Role-based guard
│       │   │   └── rateLimiter.ts
│       │   ├── services/           # Business logic
│       │   ├── db/
│       │   │   ├── schema.ts       # Drizzle ORM schema
│       │   │   └── migrations/
│       │   ├── queue/              # BullMQ jobs
│       │   └── lib/
│       └── package.json
│
├── agents/                         # Python FastAPI services
│   ├── shared/
│   │   ├── embeddings.py           # Shared embedding logic
│   │   ├── vector_store.py         # pgvector wrapper
│   │   └── llm_client.py           # OpenAI/Claude API wrapper
│   ├── agent1_knowledge/
│   │   ├── main.py                 # FastAPI app
│   │   ├── rag_pipeline.py
│   │   ├── ingestion/
│   │   │   ├── repo_crawler.py     # GitHub API crawler
│   │   │   ├── doc_parser.py       # PDF/DOCX parser
│   │   │   └── embedder.py
│   │   └── requirements.txt
│   ├── agent2_onboarder/
│   │   ├── main.py
│   │   ├── checklist_generator.py
│   │   └── requirements.txt
│   └── agent3_quizzer/
│       ├── main.py
│       ├── quiz_generator.py
│       ├── stats_tracker.py
│       └── requirements.txt
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.agent1
│   │   ├── Dockerfile.agent2
│   │   └── Dockerfile.agent3
│   └── docker-compose.yml
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
└── packages/
    └── shared-types/               # Shared TypeScript types (npm workspace)
```

## Service Responsibilities

### apps/web (React)

- Handles user-facing workflows for login, organization setup, HR monitoring, and employee onboarding.
- Maintains client-side app state with Zustand.
- Uses feature-based folder boundaries for scalable ownership.
- Hosts advanced visual modules such as code graph exploration.

### apps/api (Express)

- Single entrypoint for authentication, authorization, and request validation.
- Executes domain logic in services/ and persists via Drizzle.
- Uses BullMQ queue workers for asynchronous and retryable workflows.
- Proxies AI-related requests to specialized Python agents through routes/agent-proxy.ts.

### agents/ (FastAPI)

- agent1_knowledge: document ingestion, repository crawling, retrieval pipeline.
- agent2_onboarder: checklist and onboarding-path generation by persona.
- agent3_quizzer: quiz generation, scoring, and progress statistics.
- shared: reusable embeddings, vector store access, and model abstraction.

## Data and Integration Model

Primary technologies implied by the structure:

- Relational data: PostgreSQL managed through Drizzle schema and migrations.
- Semantic retrieval: pgvector for embeddings similarity search.
- Queueing and async jobs: Redis + BullMQ.
- Auth and identity: auth routes plus optional Firebase initialization on frontend.
- External AI providers: OpenAI and/or Claude through shared llm_client abstraction.
- Source context: GitHub repository crawling to build org-specific code understanding.

## Request Flow by Role

### System Designer

1. Registers organization.
2. Uploads documentation and system references.
3. Connects repository URLs.
4. Triggers ingestion and indexing jobs.

### HR

1. Views employee onboarding boards.
2. Tracks progress status and completion confidence.
3. Receives completion summaries and alerts.

### Employee

1. Authenticates and enters org context.
2. Gets personalized checklist and first tasks.
3. Uses chat for doc-grounded Q&A.
4. Completes quizzes and milestones.

## Local Development Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker and Docker Compose
- PostgreSQL and Redis (or Docker equivalents)

### 1) Install dependencies

At monorepo root (workspace mode):

```bash
npm install
```

For Python agents:

```bash
pip install -r agents/agent1_knowledge/requirements.txt
pip install -r agents/agent2_onboarder/requirements.txt
pip install -r agents/agent3_quizzer/requirements.txt
```

### 2) Start infrastructure services

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 3) Run applications

Run both web and API together from the root:

```bash
npm run dev
```

Run individually if needed.

Frontend:

```bash
npm run dev --workspace @onboard/web
```

API:

```bash
npm run dev --workspace @onboard/api
```

Agents (example with uvicorn):

```bash
uvicorn agents.agent1_knowledge.main:app --reload --port 8001
uvicorn agents.agent2_onboarder.main:app --reload --port 8002
uvicorn agents.agent3_quizzer.main:app --reload --port 8003
```

### 4) Apply database migrations

Run your Drizzle migration command from apps/api after environment variables are configured.

## Environment Variables

Create environment files for each service.

### apps/api/.env (example)

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/onboard_ai
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace_with_secure_secret

# Firebase Admin SDK credentials. Use one of these setups:
# - FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
# - FIREBASE_PROJECT_ID + FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

AGENT1_BASE_URL=http://localhost:8001
AGENT2_BASE_URL=http://localhost:8002
AGENT3_BASE_URL=http://localhost:8003

OPENAI_API_KEY=replace_if_used
ANTHROPIC_API_KEY=replace_if_used
GITHUB_TOKEN=replace_for_repo_crawling
```

### apps/web/.env (example)

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_optional
```

### agents/*/.env (common example)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/onboard_ai
OPENAI_API_KEY=replace_if_used
ANTHROPIC_API_KEY=replace_if_used
EMBEDDING_MODEL=text-embedding-3-large
LLM_MODEL=gpt-4.1-mini
```

## Build, Test, and Quality Gates

Suggested baseline commands:

```bash
npm run lint
npm run typecheck
npm run build
```

Python quality checks (recommended):

```bash
ruff check agents/
pytest agents/
```

CI pipeline should enforce at least:

- Lint and type checks.
- Unit tests for API services and critical agent logic.
- Security scanning for dependencies and containers.
- Migration safety checks for schema changes.

## Deployment and Infrastructure

- Container images are defined in infra/docker for API and each agent.
- docker-compose can be used for local integration and staging smoke tests.
- .github/workflows/ci.yml handles validation on pull requests.
- .github/workflows/deploy.yml can publish images and deploy per environment.

Recommended deployment pattern:

1. Deploy API and agents as independent services.
2. Keep databases and Redis managed by cloud provider.
3. Store secrets in a secure vault, not repository files.
4. Version shared contracts in packages/shared-types.

## Security and Compliance Notes

### Firebase setup required for auth

The app uses Firebase Authentication for sign-in and sign-up. Make sure these settings are configured in the Firebase console for the same project used by both the frontend and backend:

- Enable Authentication in the Firebase project.
- Enable the Email/Password sign-in provider.
- Confirm the Firebase project ID matches the frontend `VITE_FIREBASE_PROJECT_ID` and the backend service account project.
- Add `localhost:5173` to the authorized domains for local web auth testing.

If these settings are missing, sign-up can fail with `auth/configuration-not-found`, `auth/operation-not-allowed`, or similar Firebase errors.

- Enforce role-based route authorization for org, hr, and employee surfaces.
- Use rateLimiter middleware to protect auth and agent-proxy endpoints.
- Restrict retrieval results by organization boundary to prevent data leakage.
- Add audit logs for admin-level actions and checklist completion status changes.
- Never log raw access tokens, credentials, or confidential document content.

## Contribution Guidelines

### Branching

- Use short-lived feature branches from main.
- Keep pull requests focused by area: web, api, agent, infra, or shared-types.

### Commit style

- feat: new feature
- fix: bug fix
- refactor: structure improvement without behavior change
- docs: documentation updates
- chore: tooling and maintenance

### Code ownership recommendation

- apps/web/features/* owned by product/frontend team.
- apps/api/routes and services owned by backend platform team.
- agents/* owned by applied AI team.
- packages/shared-types co-owned across web and api teams.

## Troubleshooting

- API cannot reach agents:
  - Verify AGENT*_BASE_URL values.
  - Check each FastAPI process is running and reachable.

- No retrieval results from knowledge agent:
  - Confirm ingestion executed successfully.
  - Confirm embeddings are stored and indexed in pgvector-enabled database.

- Queue jobs stuck:
  - Validate Redis connectivity.
  - Check worker process startup and queue names.

- Frontend authentication issues:
  - Validate token storage and expiration handling.
  - Confirm API CORS and auth middleware configuration.

## Roadmap Ideas

- Organization-specific policy enforcement in code suggestions.
- GitHub PR onboarding assistant with first-task auto-evaluation.
- Skill-gap heatmaps generated from quiz attempts.
- Slack or Teams integration for onboarding reminders.
- Multi-language onboarding support.

---

If you want, the next iteration can include:

- API endpoint reference by route file.
- ER diagram for schema and relationship boundaries.
- Sequence diagrams for auth, ingestion, and onboarding-completion flows.