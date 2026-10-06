---
inclusion: auto
name: testing
description: CampusAI testing strategy including property-based tests
---

# CampusAI – Testing Steering

## Test Suite Location
`tests/api.test.ts` — run from `backend/` with `node node_modules/vitest/dist/cli.js run`

## Test Layers
1. **Property-based tests** (fast-check, 5 properties): skill level bounds, skill mapping determinism, extraction note presence, recommendation reason presence, missing skills subset invariant.
2. **Unit tests** (7): skill mapping per category, certificate extraction, recommendation generation.
3. **API integration tests** (13): auth register/login/duplicate/wrong-password, activity CRUD + auth, admin RBAC enforcement.

## Property Invariants
- Skill level ∈ [0, 5] for any evidence count ∈ [0, 200]
- getSkillsForCategory() returns ≥1 skill for any valid category
- extractCertificateData() always includes non-empty extractionNote
- generateRecommendations() returns ≥1 rec, all with non-empty reason
- missingSkills ⊆ ALL_SKILLS for any set of present skills

## Commands
```
cd C:\campus-ai\backend
node node_modules\vitest\dist\cli.js run --reporter=verbose
```
Expected: 25 tests pass, 0 fail.