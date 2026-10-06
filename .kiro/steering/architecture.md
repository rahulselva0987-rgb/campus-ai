---
inclusion: auto
name: architecture
description: CampusAI system architecture and layer boundaries
---

# CampusAI – Architecture Steering

## Layer Structure
```
frontend/src/          React pages + components + AuthContext
  api/client.ts        Axios with JWT interceptor
  pages/               One file per page
  components/Layout.tsx Sidebar navigation

backend/src/
  routes/              Express routers (thin: validate → call service → respond)
  services/skillService.ts  Business logic + MockAIService
  middleware/auth.ts   authenticate + requireAdmin
  prismaClient.ts      Prisma singleton

prisma/schema.prisma   SQLite schema
prisma/seed.ts         Demo data
```

## Key Rules
- **Controllers are thin**: validate with Zod → call service → return response.
- **Services own logic**: no req/res in services.
- **MockAIService**: all AI calls go through skillService.ts. Swap real LLM by changing skillService only.
- **pnpm strict-ssl false**: required due to corporate SSL inspection on this machine.

## MockAIService (skillService.ts)
Deterministic keyword-based mapping. No external API. Same input → always same output.
Categories → skills: Hackathon→[Problem Solving, Teamwork, Innovation], Workshop→[Technical, Communication], etc.