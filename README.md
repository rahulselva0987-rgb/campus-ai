# CampusAI – AI-Powered Student Activities & Achievement Intelligence Portal

A full-stack web application that creates an intelligent digital development profile for every student. The system collects activities and certificates, uses AI skill mapping to identify demonstrated competencies, detects skill gaps, and generates personalized recommendations — all runnable locally without any external API keys.

---

## Features

### Student
- Register and log in with JWT authentication
- **Dashboard** — real-time stats: activities, certificates, skills developed, skill gaps
- **Activities** — log hackathons, workshops, certifications, internships, and more; skills mapped automatically
- **Certificates** — upload PDF/image certificates; AI-assisted extraction (not proof of authenticity)
- **Skill Profile** — visual progress bars showing skill levels 0–5 with evidence counts
- **Skill Gap Analysis** — identifies missing skills from the 7-skill taxonomy
- **Recommendations** — personalized suggestions with reasons based on gaps and career goal

### Admin
- **Admin Dashboard** — real platform statistics (no hard-coded numbers)
- **Students** — view all registered students with activity and certificate counts
- **Certificate Verification** — review pending certificates and set status: Verified / Needs Review / Rejected

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Lucide React |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (via Prisma ORM) |
| Authentication | JWT (HS256, 24h expiry), bcrypt (cost 12) |
| AI / Skill Mapping | Deterministic MockAIService — no API key needed |
| Testing | Vitest, fast-check (property-based tests) |
| Package Manager | pnpm |

---

## Project Structure

```
campus-ai/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # SQLite schema
│   │   ├── seed.ts             # Demo data
│   │   └── dev.db              # SQLite database (auto-created)
│   ├── src/
│   │   ├── index.ts            # Express app entry point
│   │   ├── prismaClient.ts     # Prisma singleton
│   │   ├── middleware/auth.ts  # JWT + RBAC middleware
│   │   ├── routes/             # auth, profile, activities, certificates, skills, recommendations, admin
│   │   └── services/skillService.ts  # MockAIService (deterministic skill mapping)
│   ├── .env                    # Local environment variables (not committed)
│   ├── .env.example            # Template for environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # React Router setup
│   │   ├── main.tsx            # Entry point
│   │   ├── api/client.ts       # Axios with JWT interceptor
│   │   ├── contexts/AuthContext.tsx
│   │   ├── components/Layout.tsx  # Sidebar navigation
│   │   └── pages/              # Login, Register, Dashboard, Activities, Certificates, Skills, Recommendations, Admin*
│   └── package.json
├── tests/
│   └── api.test.ts             # 25 tests: 5 property-based + 7 unit + 13 API integration
├── .kiro/
│   ├── specs/campus-ai-simple/ # requirements.md, design.md, tasks.md
│   ├── steering/               # product.md, architecture.md, security.md, testing.md
│   ├── hooks/                  # pre-commit, post-schema, post-route-test
│   └── agents/                 # Certificate Intelligence Agent, Career Coach Agent
├── mcp/                        # MCP server for skill/activity knowledge retrieval
├── docs/
│   └── KIRO-UNIVERSITY.md      # Kiro University lesson mapping
└── README.md
```

---

## Prerequisites

- Node.js v18+ (project uses v22.11.0 portable at `C:\nodejs`)
- pnpm (portable at `C:\nodejs\pnpm.exe`)

---

## Setup

### 1. Backend

```powershell
cd C:\campus-ai\backend

# Push schema to SQLite (creates dev.db)
node node_modules\prisma\build\index.js db push --skip-generate

# Generate Prisma client
node node_modules\prisma\build\index.js generate

# Seed demo data
node node_modules\ts-node\dist\bin.js prisma/seed.ts
```

### 2. Frontend

No additional setup required — dependencies already installed.

---

## Running the Application

Open **two separate terminals**.

### Terminal 1 — Backend (port 3001)

```powershell
$env:PATH = "C:\nodejs;" + $env:PATH
cd C:\campus-ai\backend
node node_modules\ts-node\dist\bin.js src\index.ts
```

Expected output:
```
Backend running on http://localhost:3001
```

### Terminal 2 — Frontend (port 5173)

```powershell
$env:PATH = "C:\nodejs;" + $env:PATH
cd C:\campus-ai\frontend
node node_modules\vite\bin\vite.js
```

Expected output:
```
VITE v5.4.21  ready in ~680ms
➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Student | alice@student.com | student123 |
| Student | bob@student.com | student123 |
| Student | carol@student.com | student123 |
| Admin | admin@campus.ai | admin123 |

---

## Running Tests

```powershell
$env:PATH = "C:\nodejs;" + $env:PATH
cd C:\campus-ai\backend
node node_modules\vitest\dist\cli.js run --reporter=verbose
```

**Expected result: 25 tests pass, 0 fail**

Test breakdown:
- 5 property-based tests (fast-check invariants)
- 7 skill service unit tests
- 5 Auth API integration tests
- 4 Activity API integration tests
- 4 Admin authorization tests

---

## Production Build

```powershell
$env:PATH = "C:\nodejs;" + $env:PATH
cd C:\campus-ai\frontend
node node_modules\vite\bin\vite.js build
```

Output goes to `frontend/dist/`. Build produces ~264 KB JS (82 KB gzipped).

---

## Environment Variables

The backend reads from `backend/.env`. Copy `backend/.env.example` to `backend/.env` for a fresh setup:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="campus-ai-jwt-secret-change-in-production"
PORT=3001
NODE_ENV=development
```

**Never commit `.env`.** Only `.env.example` is committed.

---

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register student or admin |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/profile | Student | Full profile + recent data |
| PUT | /api/profile | Student | Update profile fields |
| GET | /api/activities | Student | List own activities |
| POST | /api/activities | Student | Add activity + auto skill map |
| GET | /api/certificates | Student | List own certificates |
| POST | /api/certificates | Student | Upload certificate + extraction |
| PATCH | /api/certificates/:id/status | Admin | Set verification status |
| GET | /api/skills | Student | Skill profile + gap list |
| GET | /api/recommendations | Student | Personalized recommendations |
| GET | /api/admin/statistics | Admin | Platform counts |
| GET | /api/admin/students | Admin | All students |
| GET | /api/admin/certificates | Admin | All certificates |
| GET | /api/health | Public | Health check |

---

## Skill Mapping (MockAIService)

Skills are mapped deterministically — no external API required:

| Activity Category | Skills Mapped |
|---|---|
| Hackathon | Problem Solving, Teamwork, Innovation |
| Workshop | Technical, Communication |
| Certification | Technical, Research |
| Competition | Problem Solving, Teamwork |
| Internship | Technical, Communication, Teamwork |
| Club Activity | Leadership, Teamwork, Communication |
| Leadership | Leadership, Communication |
| Community Service | Communication, Teamwork |

The full skill taxonomy: Technical, Communication, Leadership, Problem Solving, Teamwork, Innovation, Research.

Skill level formula: `level = min(5, floor(evidenceCount / 2) + 1)`

> **Note:** AI extraction is labeled "AI-assisted — not proof of authenticity." Only admin approval sets a certificate to Verified.

---

## Kiro University Features

| Lesson | Implementation | Location |
|---|---|---|
| Spec-driven development | requirements.md, design.md, tasks.md | `.kiro/specs/campus-ai-simple/` |
| Steering documents | product, architecture, security, testing | `.kiro/steering/` |
| Hooks | pre-commit, post-schema, post-route-test | `.kiro/hooks/` |
| Property-based testing | 5 fast-check invariants | `tests/api.test.ts` |
| Custom agents | Certificate Intelligence Agent, Career Coach Agent | `.kiro/agents/` |
| MCP integration | Skill/activity knowledge retrieval server | `mcp/` |
| Powers | Documented in KIRO-UNIVERSITY.md | `docs/KIRO-UNIVERSITY.md` |

See `docs/KIRO-UNIVERSITY.md` for full details.

---

## Known Constraints

- Node.js is installed as a portable zip at `C:\nodejs` (not a system install) — always prefix commands with `$env:PATH = "C:\nodejs;" + $env:PATH`
- pnpm uses `strict-ssl=false` due to corporate SSL inspection on this machine
- The MCP server is a standalone Express app (`mcp/server.ts`) — see `docs/KIRO-UNIVERSITY.md` for usage