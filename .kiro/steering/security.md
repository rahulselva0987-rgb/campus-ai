---
inclusion: auto
name: security
description: CampusAI security rules and patterns
---

# CampusAI – Security Steering

## Hard Rules
1. **Never store plain-text passwords.** Use bcrypt, cost factor 12.
2. **Never return password hashes** in any API response.
3. **JWT secret from env var only.** Never hardcode in source.
4. **Ownership check in service layer**: `if (resource.studentId !== req.user.id) throw ForbiddenError`.
5. **AI does not verify certificates.** Only Level 4 admin approval sets status to "verified".
6. **Never commit .env.** Only .env.example is committed.

## Patterns
- authenticate middleware on all protected routes
- requireAdmin middleware on all /api/admin/* routes
- Zod validation on all request bodies before service calls
- CORS restricted to http://localhost:5173
- File uploads: Multer 10 MB limit, accept pdf/jpg/png only