// Deterministic mock AI skill mapping service - no external API needed
export const SKILL_MAP: Record<string, string[]> = {
  'Hackathon': ['Problem Solving', 'Teamwork', 'Innovation'],
  'Workshop': ['Technical', 'Communication'],
  'Certification': ['Technical', 'Research'],
  'Competition': ['Problem Solving', 'Teamwork'],
  'Internship': ['Technical', 'Communication', 'Teamwork'],
  'Club Activity': ['Leadership', 'Teamwork', 'Communication'],
  'Leadership': ['Leadership', 'Communication'],
  'Community Service': ['Communication', 'Teamwork'],
};

export const ALL_SKILLS = ['Technical', 'Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Innovation', 'Research'];

export function getSkillsForCategory(category: string): string[] {
  return SKILL_MAP[category] || ['Communication', 'Teamwork'];
}

export function extractCertificateData(fileName: string, title: string): Record<string, string> {
  // Deterministic extraction based on title keywords - no OCR API needed
  const lower = (title || fileName || '').toLowerCase();
  let category = 'General';
  let skills: string[] = [];

  if (lower.includes('hackathon')) { category = 'Hackathon'; skills = SKILL_MAP['Hackathon']; }
  else if (lower.includes('workshop')) { category = 'Workshop'; skills = SKILL_MAP['Workshop']; }
  else if (lower.includes('leadership')) { category = 'Leadership'; skills = SKILL_MAP['Leadership']; }
  else if (lower.includes('python') || lower.includes('java') || lower.includes('aws') || lower.includes('react')) {
    category = 'Certification'; skills = SKILL_MAP['Certification'];
  }
  else if (lower.includes('competition') || lower.includes('olympiad')) {
    category = 'Competition'; skills = SKILL_MAP['Competition'];
  }
  else { skills = ['Communication', 'Teamwork']; }

  return {
    extractedTitle: title,
    extractedCategory: category,
    extractedSkills: skills.join(', '),
    extractionNote: 'AI-assisted extraction (not proof of authenticity)',
  };
}

export function generateRecommendations(missingSkills: string[], careerGoal: string) {
  const recs = [];
  if (missingSkills.includes('Technical')) {
    recs.push({ title: 'Join a Hackathon', description: 'Strengthen technical and problem-solving skills', reason: 'You need more Technical skill evidence', type: 'Hackathon' });
    recs.push({ title: 'Complete an Online Certification', description: 'Get certified in a relevant technology', reason: 'Certifications directly boost Technical skills', type: 'Certification' });
  }
  if (missingSkills.includes('Leadership')) {
    recs.push({ title: 'Join a Club as an Officer', description: 'Take on a leadership role in a student club', reason: 'Club leadership develops Leadership and Communication', type: 'Club Activity' });
  }
  if (missingSkills.includes('Communication')) {
    recs.push({ title: 'Attend a Communication Workshop', description: 'Improve presentation and writing skills', reason: 'Workshops develop Communication skills', type: 'Workshop' });
  }
  if (missingSkills.includes('Research')) {
    recs.push({ title: 'Participate in Research Project', description: 'Work with a faculty member on research', reason: 'Research activities develop Research and Technical skills', type: 'Workshop' });
  }
  if (careerGoal.toLowerCase().includes('software') || careerGoal.toLowerCase().includes('developer')) {
    recs.push({ title: 'Build a Personal Project', description: 'Create an open-source project for your portfolio', reason: 'Projects demonstrate technical and problem-solving ability', type: 'Hackathon' });
  }
  if (recs.length === 0) {
    recs.push({ title: 'Attend a Leadership Workshop', description: 'Develop leadership and soft skills', reason: 'Broad skill development benefits all career paths', type: 'Workshop' });
    recs.push({ title: 'Join a Technical Club', description: 'Network and learn with peers', reason: 'Clubs build teamwork and communication skills', type: 'Club Activity' });
  }
  return recs.slice(0, 5);
}