# Tasks — CampusAI Simple

## Phase 1: Foundation
- [x] 1.1 Initialize backend with Express + TypeScript + Prisma
- [x] 1.2 Create Prisma schema (User, StudentProfile, Activity, Certificate, Skill, StudentSkill, Recommendation)
- [x] 1.3 Push schema to SQLite dev.db
- [x] 1.4 Initialize frontend with Vite + React + TypeScript + Tailwind

## Phase 2: Authentication
- [x] 2.1 POST /api/auth/register with bcrypt hashing
- [x] 2.2 POST /api/auth/login with JWT generation
- [x] 2.3 authenticate middleware (JWT verification)
- [x] 2.4 requireAdmin middleware (role check)
- [x] 2.5 Login page (frontend)
- [x] 2.6 Register page (frontend)
- [x] 2.7 AuthContext with localStorage persistence

## Phase 3: MockAIService
- [x] 3.1 getSkillsForCategory() — deterministic skill mapping
- [x] 3.2 extractCertificateData() — keyword-based certificate extraction
- [x] 3.3 generateRecommendations() — gap-based recommendation generation

## Phase 4: Backend Routes
- [x] 4.1 GET/PUT /api/profile
- [x] 4.2 GET/POST /api/activities (with skill mapping trigger)
- [x] 4.3 GET/POST /api/certificates (with file upload + extraction)
- [x] 4.4 PATCH /api/certificates/:id/status (admin only)
- [x] 4.5 GET /api/skills (skill profile + gaps)
- [x] 4.6 GET /api/recommendations (auto-generate if empty)
- [x] 4.7 GET /api/admin/statistics (real DB counts)
- [x] 4.8 GET /api/admin/students
- [x] 4.9 GET /api/admin/certificates

## Phase 5: Frontend Pages
- [x] 5.1 Layout component with sidebar navigation
- [x] 5.2 Student Dashboard (stats, recent activities, skill profile)
- [x] 5.3 Activities page (list + add form)
- [x] 5.4 Certificates page (list + upload form + status badges)
- [x] 5.5 Skills page (progress bars + gap analysis)
- [x] 5.6 Recommendations page
- [x] 5.7 Admin Dashboard (real stats)
- [x] 5.8 Admin Students page (table)
- [x] 5.9 Admin Certificates page (verification actions)

## Phase 6: Testing
- [x] 6.1 Property-based tests (fast-check) — 5 invariants
- [x] 6.2 Skill service unit tests — 7 tests
- [x] 6.3 Auth API integration tests — 5 tests
- [x] 6.4 Activity API integration tests — 4 tests
- [x] 6.5 Admin authorization tests — 4 tests

## Phase 7: Kiro Artifacts
- [x] 7.1 .kiro/specs/campus-ai-simple/requirements.md
- [x] 7.2 .kiro/specs/campus-ai-simple/design.md
- [x] 7.3 .kiro/specs/campus-ai-simple/tasks.md (this file)
- [x] 7.4 .kiro/hooks/ — pre-commit and post-schema hooks
- [x] 7.5 .kiro/agents/ — Certificate Intelligence Agent, Career Coach Agent
- [x] 7.6 .kiro/steering/ — product.md, architecture.md
- [x] 7.7 mcp/ — MCP server for skill/activity knowledge retrieval
- [x] 7.8 docs/KIRO-UNIVERSITY.md
- [x] 7.9 Seed data (3 students, admin, activities, certificates)
- [x] 7.10 README.md

## Phase 8: Verification
- [x] 8.1 All 25 tests pass
- [x] 8.2 Frontend builds successfully (1430 modules)
- [x] 8.3 Backend starts on port 3001
- [x] 8.4 Database seeded with demo data