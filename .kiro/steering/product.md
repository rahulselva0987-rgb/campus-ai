---
inclusion: auto
name: product
description: CampusAI product vision, constraints, and user roles
---

# CampusAI – Product Steering

## Product Vision
An AI-powered student activities portal that creates an intelligent development profile for every student — mapping skills from activities and certificates, detecting gaps, and recommending next steps.

## Roles
- **Student**: register, log activities, upload certificates, view skills/gaps/recommendations
- **Admin**: review and verify certificate submissions, view platform statistics

## Core Constraints
- **AI is assistive, not authoritative.** Certificate extraction is labeled "AI-assisted (not proof of authenticity)".
- **No API key needed for local dev.** MockAIService provides deterministic fallback.
- **All statistics are real DB counts.** No hard-coded numbers anywhere.
- **Admin verification required.** Certificates never auto-verified by AI.

## Tech Stack
Frontend: React 18 + Vite + TypeScript + Tailwind CSS + Lucide React
Backend: Node.js + Express + TypeScript + Prisma + SQLite
Auth: JWT (HS256, 24h expiry) + bcrypt (cost 12)
Testing: Vitest + fast-check (property-based)