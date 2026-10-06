# Design Document — CampusAI Simple

## Architecture Overview

```
Browser (React + Vite + Tailwind)
        |  HTTP/JSON  |  /uploads static
        v
Express API (Node.js + TypeScript)
  routes/auth.ts      → POST /api/auth/register|login
  routes/profile.ts   → GET/PUT /api/profile
  routes/activities.ts → GET/POST /api/activities
  routes/certificates.ts → GET/POST /api/certificates, PATCH /:id/status
  routes/skills.ts    → GET /api/skills
  routes/recommendations.ts → GET /api/recommendations
  routes/admin.ts     → GET /api/admin/statistics|students|certificates
        |
        v
services/skillService.ts  (MockAIService — no external API)
        |
        v
prismaClient.ts → SQLite via Prisma ORM (dev.db)
```

## Database Schema (SQLite via Prisma)

Models: User, StudentProfile, Activity, Certificate, Skill, StudentSkill, Recommendation

Key relationships:
- User 1:1 StudentProfile
- StudentProfile 1:N Activity, Certificate, StudentSkill, Recommendation
- StudentSkill N:1 Skill (unique per student+skill pair)

## MockAIService Design

Deterministic keyword-based mapping. No external API required.

### Skill Map
| Category | Skills |
|---|---|
| Hackathon | Problem Solving, Teamwork, Innovation |
| Workshop | Technical, Communication |
| Certification | Technical, Research |
| Competition | Problem Solving, Teamwork |
| Internship | Technical, Communication, Teamwork |
| Club Activity | Leadership, Teamwork, Communication |
| Leadership | Leadership, Communication |
| Community Service | Communication, Teamwork |

### Certificate Extraction
Keyword matching on title: python/java/aws/react → Certification, hackathon → Hackathon, etc.

### Skill Level Formula
```
level = min(5, floor(evidenceCount / 2) + 1)
```

## Frontend Architecture

- React Router v6 for routing
- Axios with JWT interceptor
- AuthContext for auth state (localStorage)
- Tailwind CSS for all styling
- Lucide React for icons
- Pages: Login, Register, Dashboard, Activities, Certificates, Skills, Recommendations
- Admin pages: AdminDashboard, AdminStudents, AdminCertificates

## Security
- Passwords: bcrypt cost factor 12
- JWT: HS256, 24h expiry, secret from env var
- RBAC: authenticate middleware + requireAdmin middleware
- Ownership: service layer checks studentId === req.user.id
- File uploads: Multer with 10 MB limit
- CORS: origin restricted to http://localhost:5173

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register |
| POST | /api/auth/login | Public | Login |
| GET | /api/profile | Student | Get profile |
| PUT | /api/profile | Student | Update profile |
| GET | /api/activities | Student | List activities |
| POST | /api/activities | Student | Add activity + skill map |
| GET | /api/certificates | Student | List certificates |
| POST | /api/certificates | Student | Upload certificate |
| PATCH | /api/certificates/:id/status | Admin | Update verification status |
| GET | /api/skills | Student | Skill profile + gaps |
| GET | /api/recommendations | Student | Personalized recommendations |
| GET | /api/admin/statistics | Admin | Platform counts |
| GET | /api/admin/students | Admin | All students |
| GET | /api/admin/certificates | Admin | All certificates |
| GET | /api/health | Public | Health check |