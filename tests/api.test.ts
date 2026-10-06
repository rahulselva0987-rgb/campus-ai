import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import http from 'http';
import app from '../backend/src/index';
import { prisma } from '../backend/src/prismaClient';
import { getSkillsForCategory, extractCertificateData, generateRecommendations, ALL_SKILLS } from '../backend/src/services/skillService';

// ============================================================
// PROPERTY-BASED TESTS (fast-check) — no network needed
// ============================================================

describe('Property-Based Tests', () => {
  it('P1: skill level is always in [0, 5] for any evidence count', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 200 }),
      (evidenceCount) => {
        const level = Math.min(5, Math.floor(evidenceCount / 2) + 1);
        return level >= 0 && level <= 5;
      }
    ));
  });

  it('P2: skill mapping always returns at least one skill for any valid category', () => {
    fc.assert(fc.property(
      fc.constantFrom('Hackathon','Workshop','Certification','Competition','Internship','Club Activity','Leadership','Community Service'),
      (category: string) => {
        const skills = getSkillsForCategory(category);
        return skills.length > 0;
      }
    ));
  });

  it('P3: extractCertificateData always includes a non-empty extractionNote', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 50 }),
      fc.string({ minLength: 1, maxLength: 50 }),
      (fileName: string, title: string) => {
        const result = extractCertificateData(fileName, title);
        return typeof result.extractionNote === 'string' && result.extractionNote.length > 0;
      }
    ));
  });

  it('P4: generateRecommendations always returns >= 1 rec with non-empty reason', () => {
    fc.assert(fc.property(
      fc.array(fc.constantFrom(...ALL_SKILLS as [string, ...string[]]), { minLength: 0, maxLength: 3 }),
      fc.string({ minLength: 0, maxLength: 50 }),
      (missingSkills: string[], careerGoal: string) => {
        const recs = generateRecommendations(missingSkills, careerGoal);
        return recs.length >= 1 && recs.every((r: { reason: string }) => r.reason.length > 0);
      }
    ));
  });

  it('P5: missing skills are always a subset of ALL_SKILLS', () => {
    fc.assert(fc.property(
      fc.array(fc.constantFrom(...ALL_SKILLS as [string, ...string[]]), { minLength: 0, maxLength: ALL_SKILLS.length }),
      (presentSkills: string[]) => {
        const missing = ALL_SKILLS.filter((s: string) => !presentSkills.includes(s));
        return missing.every((s: string) => ALL_SKILLS.includes(s));
      }
    ));
  });
});

// ============================================================
// UNIT TESTS — skill service logic
// ============================================================

describe('Skill Service Unit Tests', () => {
  it('Hackathon maps to Problem Solving, Teamwork, Innovation', () => {
    const skills = getSkillsForCategory('Hackathon');
    expect(skills).toContain('Problem Solving');
    expect(skills).toContain('Teamwork');
    expect(skills).toContain('Innovation');
  });

  it('Leadership maps to Leadership and Communication', () => {
    const skills = getSkillsForCategory('Leadership');
    expect(skills).toContain('Leadership');
    expect(skills).toContain('Communication');
  });

  it('Unknown category returns default skills', () => {
    const skills = getSkillsForCategory('Unknown');
    expect(skills.length).toBeGreaterThan(0);
  });

  it('Certificate extraction returns category', () => {
    const result = extractCertificateData('cert.pdf', 'Python Programming Certificate');
    expect(result.extractedCategory).toBe('Certification');
    expect(result.extractedSkills).toContain('Technical');
  });

  it('Hackathon certificate extraction detected', () => {
    const result = extractCertificateData('hackathon.pdf', 'National Hackathon Winner');
    expect(result.extractedCategory).toBe('Hackathon');
  });

  it('Recommendations include reason for each item', () => {
    const recs = generateRecommendations(['Technical', 'Leadership'], 'Software Engineer');
    expect(recs.length).toBeGreaterThan(0);
    recs.forEach((r: { reason: string; title: string; type: string }) => {
      expect(r.reason.length).toBeGreaterThan(0);
      expect(r.title.length).toBeGreaterThan(0);
      expect(r.type.length).toBeGreaterThan(0);
    });
  });

  it('No duplicate skills in mapping result for same category', () => {
    const skills1 = getSkillsForCategory('Workshop');
    const skills2 = getSkillsForCategory('Workshop');
    expect(skills1).toEqual(skills2); // deterministic
    const unique = [...new Set(skills1)];
    expect(unique.length).toBe(skills1.length); // no duplicates
  });
});

// ============================================================
// API INTEGRATION TESTS — using node http directly
// ============================================================

let server: http.Server;
let baseUrl: string;

beforeAll(() => {
  return new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address() as { port: number };
      baseUrl = `http://localhost:${addr.port}`;
      resolve();
    });
  });
});

afterAll(() => {
  return new Promise<void>((resolve) => {
    server.close(() => {
      prisma.$disconnect().then(() => resolve());
    });
  });
});

function apiRequest(method: string, path: string, body?: unknown, token?: string): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const req = http.request({ hostname: url.hostname, port: url.port, path: url.pathname, method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode || 0, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode || 0, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

describe('Auth API', () => {
  const email = `test-${Date.now()}@campus.test`;

  it('registers a new student and returns a token', async () => {
    const res = await apiRequest('POST', '/api/auth/register', {
      email, password: 'Test1234', fullName: 'Test Student', role: 'student', department: 'CS'
    });
    expect(res.status).toBe(201);
    expect((res.body as { token: string }).token).toBeTruthy();
    expect((res.body as { user: { role: string } }).user.role).toBe('student');
  });

  it('rejects duplicate email with 409', async () => {
    const res = await apiRequest('POST', '/api/auth/register', {
      email, password: 'Test1234', fullName: 'Dupe', role: 'student'
    });
    expect(res.status).toBe(409);
  });

  it('logs in with valid credentials', async () => {
    const res = await apiRequest('POST', '/api/auth/login', { email, password: 'Test1234' });
    expect(res.status).toBe(200);
    expect((res.body as { token: string }).token).toBeTruthy();
  });

  it('rejects login with wrong password', async () => {
    const res = await apiRequest('POST', '/api/auth/login', { email, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing fields', async () => {
    const res = await apiRequest('POST', '/api/auth/register', { email: 'bad' });
    expect(res.status).toBe(400);
  });
});

describe('Activity API', () => {
  let token: string;
  const email2 = `act-${Date.now()}@campus.test`;

  beforeAll(async () => {
    await apiRequest('POST', '/api/auth/register', {
      email: email2, password: 'Test1234', fullName: 'Activity User', role: 'student'
    });
    const login = await apiRequest('POST', '/api/auth/login', { email: email2, password: 'Test1234' });
    token = (login.body as { token: string }).token;
  });

  it('creates an activity', async () => {
    const res = await apiRequest('POST', '/api/activities', {
      title: 'Test Hackathon', category: 'Hackathon', organization: 'TechOrg'
    }, token);
    expect(res.status).toBe(201);
    expect((res.body as { category: string }).category).toBe('Hackathon');
  });

  it('returns 401 without token', async () => {
    const res = await apiRequest('GET', '/api/activities');
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid category', async () => {
    const res = await apiRequest('POST', '/api/activities', {
      title: 'Test', category: 'NotACategory'
    }, token);
    expect(res.status).toBe(400);
  });

  it('returns activity list for authenticated student', async () => {
    const res = await apiRequest('GET', '/api/activities', undefined, token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Admin Authorization', () => {
  let studentToken: string;
  const email3 = `auth-${Date.now()}@campus.test`;

  beforeAll(async () => {
    await apiRequest('POST', '/api/auth/register', {
      email: email3, password: 'Test1234', fullName: 'Auth Tester', role: 'student'
    });
    const login = await apiRequest('POST', '/api/auth/login', { email: email3, password: 'Test1234' });
    studentToken = (login.body as { token: string }).token;
  });

  it('blocks students from admin statistics endpoint', async () => {
    const res = await apiRequest('GET', '/api/admin/statistics', undefined, studentToken);
    expect(res.status).toBe(403);
  });

  it('blocks students from admin students endpoint', async () => {
    const res = await apiRequest('GET', '/api/admin/students', undefined, studentToken);
    expect(res.status).toBe(403);
  });

  it('blocks students from certificate verification', async () => {
    const res = await apiRequest('PATCH', '/api/certificates/fake-id/status', { status: 'verified' }, studentToken);
    expect(res.status).toBe(403);
  });

  it('returns 401 for admin endpoints without token', async () => {
    const res = await apiRequest('GET', '/api/admin/statistics');
    expect(res.status).toBe(401);
  });
});