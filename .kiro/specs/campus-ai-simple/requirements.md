# Requirements Document — CampusAI Simple

## Introduction
CampusAI is an AI-Powered Student Activities & Achievement Intelligence Portal. This simple version builds a full-stack, locally-runnable web application that creates an intelligent digital development profile for every student using React, TypeScript, Node.js, Express, Prisma, and SQLite.

## Glossary
- **Activity**: A student participation record of type Hackathon, Workshop, Certification, Competition, Internship, Club Activity, Leadership, or Community Service.
- **Certificate**: A document (PDF/image) uploaded by a student as evidence of an achievement.
- **Skill**: A named competency (Technical, Communication, Leadership, Problem Solving, Teamwork, Innovation, Research) tracked per student.
- **Skill Gap**: A skill present in ALL_SKILLS but not yet demonstrated by a student.
- **MockAIService**: A deterministic keyword-matching service that maps activities to skills without any external API.
- **Verification_Status**: One of pending, verified, needs_review, rejected.

## Requirements

### Requirement 1: Authentication
**User Story:** As a user, I want to register and log in securely so that I can access my personalized profile.
#### Acceptance Criteria
1. WHEN a user registers with email, password (≥6 chars), fullName, and role, THE system SHALL create a User record with bcrypt-hashed password and return a JWT.
2. IF email already exists, THE system SHALL return HTTP 409.
3. WHEN a user logs in with valid credentials, THE system SHALL return a JWT with 24h expiry.
4. IF credentials are invalid, THE system SHALL return HTTP 401 with a generic message.
5. THE system SHALL return HTTP 401 for protected routes without a valid JWT.
6. THE system SHALL return HTTP 403 when a student accesses admin-only routes.

### Requirement 2: Student Activities
**User Story:** As a student, I want to log activities so the system maps them to skills automatically.
#### Acceptance Criteria
1. WHEN a student submits an activity with title, category, organization, description, THE system SHALL persist it and trigger skill mapping.
2. THE system SHALL accept exactly 8 categories: Hackathon, Workshop, Certification, Competition, Internship, Club Activity, Leadership, Community Service.
3. IF category is not one of the 8 valid values, THE system SHALL return HTTP 400.
4. WHEN skill mapping runs, THE MockAIService SHALL map each category to its defined skills deterministically.
5. THE system SHALL never produce duplicate StudentSkill records for the same (student, skill) pair.

### Requirement 3: Certificate Upload
**User Story:** As a student, I want to upload certificates so the system extracts information and maps skills.
#### Acceptance Criteria
1. WHEN a student uploads a certificate file (PDF/JPG/PNG, max 10 MB), THE system SHALL create a Certificate record with status "pending".
2. THE MockAIService SHALL extract category and skills deterministically from the certificate title keywords.
3. WHEN a certificate is uploaded, THE system SHALL display "AI-assisted extraction (not proof of authenticity)" in the UI.
4. THE system SHALL never mark a certificate "verified" automatically — only admin can do this.

### Requirement 4: Skill Profile and Gap Analysis
**User Story:** As a student, I want to see my skills and gaps so I can plan my development.
#### Acceptance Criteria
1. WHEN a student views skills, THE system SHALL return all StudentSkill records with level and evidence count.
2. THE system SHALL compute Skill_Level as min(5, floor(evidenceCount / 2) + 1).
3. THE system SHALL identify missingSkills as ALL_SKILLS not yet in the student's profile.
4. Skill levels SHALL always be integers in [0, 5].

### Requirement 5: Recommendations
**User Story:** As a student, I want personalized recommendations to close my skill gaps.
#### Acceptance Criteria
1. WHEN recommendations are generated, THE system SHALL use the student's missing skills and career goal as inputs.
2. EVERY recommendation SHALL include a non-empty reason string.
3. THE system SHALL return at least 1 recommendation for any student profile.

### Requirement 6: Admin Verification
**User Story:** As an admin, I want to review and verify student certificates.
#### Acceptance Criteria
1. WHEN an admin requests the certificate list, THE system SHALL return all certificates with student name and department.
2. WHEN an admin sets a certificate status, THE system SHALL accept: verified, needs_review, rejected.
3. IF an invalid status is submitted, THE system SHALL return HTTP 400.
4. THE admin dashboard SHALL display real database counts (no hard-coded values).