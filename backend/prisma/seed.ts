import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@campus.ai' },
    update: {},
    create: { email: 'admin@campus.ai', password: adminHash, role: 'admin' }
  });
  console.log('Admin created:', admin.email);

  // Create students
  const studentHash = await bcrypt.hash('student123', 12);
  const students = [
    { email: 'alice@student.com', name: 'Alice Johnson', dept: 'Computer Science', year: 2 },
    { email: 'bob@student.com', name: 'Bob Smith', dept: 'Electronics', year: 3 },
    { email: 'carol@student.com', name: 'Carol Davis', dept: 'Mechanical', year: 1 },
  ];

  for (const s of students) {
    const user = await prisma.user.upsert({
      where: { email: s.email }, update: {},
      create: { email: s.email, password: studentHash, role: 'student' }
    });
    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id }, update: {},
      create: { userId: user.id, fullName: s.name, department: s.dept, year: s.year, careerGoal: 'Software Engineer' }
    });

    // Add activities
    const acts = [
      { title: 'National Hackathon 2024', category: 'Hackathon', organization: 'TechCorp', achievement: 'Runner-up' },
      { title: 'Python Workshop', category: 'Workshop', organization: 'Coding Club', achievement: 'Completed' },
    ];
    for (const a of acts) {
      await prisma.activity.create({ data: { ...a, description: '', studentId: profile.id } });
    }

    // Add certificate
    await prisma.certificate.create({
      data: {
        studentId: profile.id, title: 'Python Programming Certificate', organization: 'Coursera',
        issueDate: '2024-01-15', category: 'Certification', achievement: 'Passed with Distinction',
        status: 'pending', extractedData: JSON.stringify({ extractedCategory: 'Certification', extractedSkills: 'Technical, Research' })
      }
    });

    // Add skills
    const skillData = [
      { name: 'Technical', level: 3, evidence: 5 },
      { name: 'Problem Solving', level: 2, evidence: 3 },
      { name: 'Teamwork', level: 2, evidence: 3 },
    ];
    for (const sk of skillData) {
      let skill = await prisma.skill.findUnique({ where: { name: sk.name } });
      if (!skill) skill = await prisma.skill.create({ data: { name: sk.name, category: 'General', description: sk.name + ' skill' } });
      await prisma.studentSkill.upsert({
        where: { studentId_skillId: { studentId: profile.id, skillId: skill.id } },
        update: { level: sk.level, evidence: sk.evidence },
        create: { studentId: profile.id, skillId: skill.id, level: sk.level, evidence: sk.evidence }
      });
    }
    console.log('Student seeded:', s.email);
  }

  // Ensure all skills exist
  const allSkills = ['Technical', 'Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Innovation', 'Research'];
  for (const name of allSkills) {
    await prisma.skill.upsert({ where: { name }, update: {}, create: { name, category: 'General', description: name + ' skill' } });
  }

  console.log('Seed complete!');
  console.log('Demo credentials:');
  console.log('  Admin: admin@campus.ai / admin123');
  console.log('  Student: alice@student.com / student123');
}

main().catch(console.error).finally(() => prisma.$disconnect());