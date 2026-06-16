import { Job, Profile, MatchAnalysis, TailoredResume, CoverLetter } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Calculate detailed match analysis between job and profile
export function calculateMatchAnalysis(job: Job, profile: Profile): MatchAnalysis {
  // Skills Match
  const jobSkills = job.skills.map(s => s.toLowerCase());
  const profileSkills = profile.skills.map(s => s.toLowerCase());
  
  const matchedSkills = jobSkills.filter(skill =>
    profileSkills.some(ps => ps.includes(skill) || skill.includes(ps))
  );
  const missingSkills = jobSkills.filter(skill =>
    !profileSkills.some(ps => ps.includes(skill) || skill.includes(ps))
  );
  
  const skillsScore = jobSkills.length > 0 
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : 50;

  // Experience Match
  const expYears = profile.experience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate || new Date());
    return total + (end.getFullYear() - start.getFullYear());
  }, 0);
  
  const requiredExp = parseInt(job.experience) || 0;
  const experienceScore = Math.min(100, Math.round((expYears / Math.max(requiredExp, 1)) * 100));

  // Title Match
  const jobTitleWords = job.title.toLowerCase().split(' ');
  const profileTitles = profile.experience.map(e => e.title.toLowerCase());
  const titleMatchCount = jobTitleWords.filter(word =>
    profileTitles.some(title => title.includes(word))
  ).length;
  const titleScore = Math.round((titleMatchCount / jobTitleWords.length) * 100);

  // Location Match
  const locationCompatible = profile.preferredLocations.some(loc =>
    job.location.toLowerCase().includes(loc.toLowerCase()) ||
    job.country.toLowerCase().includes(loc.toLowerCase())
  ) || profile.remotePreference === 'remote' && job.remote === 'remote';
  const locationScore = locationCompatible ? 100 : 60;

  // Certifications Match
  const certNames = profile.certifications.map(c => c.name.toLowerCase());
  const matchedCerts = job.requirements.filter(req =>
    certNames.some(cert => req.toLowerCase().includes(cert))
  );
  const certScore = profile.certifications.length > 0 ? 75 : 40;

  // Keywords Match
  const descriptionWords = job.description.toLowerCase().split(/\s+/);
  const profileKeywords = [
    ...profile.skills,
    ...profile.experience.flatMap(e => e.title.split(' ')),
    ...profile.certifications.map(c => c.name)
  ].map(k => k.toLowerCase());
  
  const matchedKeywords = descriptionWords.filter(word =>
    profileKeywords.some(pk => pk.includes(word) && word.length > 3)
  );
  const keywordsScore = Math.min(100, Math.round((matchedKeywords.length / 10) * 100));

  // ATS Analysis
  const atsScore = Math.round((skillsScore * 0.4 + keywordsScore * 0.3 + experienceScore * 0.3));
  const atsSuggestions = generateATSSuggestions(job, profile, missingSkills);

  // Overall Score
  const overallScore = Math.round(
    skillsScore * 0.35 +
    experienceScore * 0.25 +
    titleScore * 0.15 +
    locationScore * 0.10 +
    certScore * 0.08 +
    keywordsScore * 0.07
  );

  return {
    overallScore,
    skillsMatch: {
      score: skillsScore,
      matched: matchedSkills,
      missing: missingSkills.slice(0, 5)
    },
    experienceMatch: {
      score: experienceScore,
      required: job.experience,
      candidate: `${expYears}+ years`
    },
    titleMatch: {
      score: titleScore,
      similarity: titleScore
    },
    locationMatch: {
      score: locationScore,
      compatible: locationCompatible
    },
    certificationsMatch: {
      score: certScore,
      matched: matchedCerts.slice(0, 3),
      recommended: getRecommendedCertifications(job)
    },
    keywordsMatch: {
      score: keywordsScore,
      matched: matchedKeywords.slice(0, 10),
      missing: missingSkills.slice(0, 5)
    },
    atsAnalysis: {
      score: atsScore,
      suggestions: atsSuggestions
    }
  };
}

function generateATSSuggestions(_job: Job, profile: Profile, missingSkills: string[]): string[] {
  const suggestions: string[] = [];
  
  if (missingSkills.length > 0) {
    suggestions.push(`Add these skills to your resume: ${missingSkills.slice(0, 3).join(', ')}`);
  }
  
  if (profile.summary.length < 100) {
    suggestions.push('Expand your professional summary to include relevant keywords');
  }
  
  suggestions.push('Use action verbs like "implemented", "managed", "designed" in your experience');
  suggestions.push('Quantify achievements with numbers and metrics where possible');
  
  if (profile.certifications.length === 0) {
    suggestions.push('Consider adding relevant certifications to strengthen your application');
  }
  
  return suggestions;
}

function getRecommendedCertifications(job: Job): string[] {
  const certMap: { [key: string]: string[] } = {
    'network': ['CCNA', 'CCNP', 'CompTIA Network+'],
    'security': ['Security+', 'CISSP', 'CEH'],
    'cloud': ['AWS Solutions Architect', 'Azure Administrator', 'GCP Professional'],
    'devops': ['Kubernetes CKA', 'Terraform Associate', 'AWS DevOps'],
    'system': ['MCSA', 'RHCSA', 'VMware VCP'],
    'cisco': ['CCNA', 'CCNP', 'CCIE'],
    'fortinet': ['NSE4', 'NSE5', 'NSE6'],
    'aruba': ['ACMA', 'ACMP', 'ACCP']
  };
  
  const titleLower = job.title.toLowerCase();
  for (const [key, certs] of Object.entries(certMap)) {
    if (titleLower.includes(key)) {
      return certs;
    }
  }
  
  return ['CompTIA A+', 'ITIL Foundation'];
}

// Generate tailored resume
export function generateTailoredResume(job: Job, profile: Profile, user: { name: string; email: string; phone: string; location: string }): TailoredResume {
  const analysis = calculateMatchAnalysis(job, profile);
  
  // Generate optimized content
  const optimizedSummary = generateOptimizedSummary(job, profile);
  const optimizedExperience = generateOptimizedExperience(job, profile);
  const optimizedSkills = generateOptimizedSkills(job, profile);
  
  const tailoredContent = `
${user.name.toUpperCase()}
${user.email} | ${user.phone} | ${user.location}
${profile.experience[0]?.title || 'Professional'}

PROFESSIONAL SUMMARY
${optimizedSummary}

CORE COMPETENCIES
${optimizedSkills}

PROFESSIONAL EXPERIENCE
${optimizedExperience}

EDUCATION
${profile.education.map(edu => `${edu.degree} in ${edu.field}
${edu.institution} | ${edu.graduationDate}`).join('\n\n')}

CERTIFICATIONS
${profile.certifications.map(cert => `• ${cert.name} - ${cert.issuer} (${cert.issueDate})`).join('\n')}

TECHNICAL SKILLS
${profile.skills.join(' | ')}
  `.trim();

  return {
    id: uuidv4(),
    jobId: job.id,
    userId: profile.userId,
    originalContent: profile.summary,
    tailoredContent,
    atsScore: analysis.atsAnalysis.score,
    optimizations: analysis.atsAnalysis.suggestions,
    keywords: analysis.skillsMatch.matched,
    createdAt: new Date().toISOString()
  };
}

function generateOptimizedSummary(job: Job, profile: Profile): string {
  const yearsExp = profile.experience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate || new Date());
    return total + Math.max(0, end.getFullYear() - start.getFullYear());
  }, 0);

  const topSkills = profile.skills.slice(0, 5).join(', ');
  const jobTitle = job.title;
  
  return `Results-driven ${jobTitle} with ${yearsExp}+ years of experience in ${topSkills}. ` +
    `Proven track record of delivering high-quality solutions and driving operational excellence. ` +
    `Seeking to leverage expertise in ${job.skills.slice(0, 3).join(', ')} to contribute to ${job.company}'s success.`;
}

function generateOptimizedExperience(_job: Job, profile: Profile): string {
  return profile.experience.map(exp => {
    const relevantAchievements = exp.achievements.length > 0 
      ? exp.achievements.slice(0, 4).map(a => `• ${a}`).join('\n')
      : `• ${exp.description}`;
    
    return `${exp.title.toUpperCase()}
${exp.company} | ${exp.location}
${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}

${relevantAchievements}`;
  }).join('\n\n');
}

function generateOptimizedSkills(job: Job, profile: Profile): string {
  // Prioritize skills that match the job
  const jobSkillsLower = job.skills.map(s => s.toLowerCase());
  const matchedSkills = profile.skills.filter(skill =>
    jobSkillsLower.some(js => js.includes(skill.toLowerCase()) || skill.toLowerCase().includes(js))
  );
  const otherSkills = profile.skills.filter(skill =>
    !jobSkillsLower.some(js => js.includes(skill.toLowerCase()) || skill.toLowerCase().includes(js))
  );
  
  const orderedSkills = [...matchedSkills, ...otherSkills];
  
  // Format in columns
  const skillsPerRow = 4;
  const rows: string[] = [];
  for (let i = 0; i < orderedSkills.length; i += skillsPerRow) {
    rows.push(orderedSkills.slice(i, i + skillsPerRow).join(' | '));
  }
  
  return rows.join('\n');
}

// Generate cover letter
export function generateCoverLetter(job: Job, profile: Profile, user: { name: string; email: string; phone: string; location: string }): CoverLetter {
  const yearsExp = profile.experience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate || new Date());
    return total + Math.max(0, end.getFullYear() - start.getFullYear());
  }, 0);
  
  const topSkills = profile.skills.slice(0, 5).join(', ');
  const currentRole = profile.experience[0]?.title || 'IT Professional';
  const currentCompany = profile.experience[0]?.company || 'my current organization';
  
  const content = `${user.name}
${user.location}
${user.email}
${user.phone}

${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Hiring Manager
${job.company}
${job.location}

Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With ${yearsExp}+ years of experience in ${topSkills}, I am confident in my ability to contribute effectively to your team and help drive ${job.company}'s continued success.

In my current role as ${currentRole} at ${currentCompany}, I have developed expertise in ${profile.skills.slice(0, 3).join(', ')}. ${profile.experience[0]?.achievements[0] || 'I have consistently delivered results that exceed expectations and contributed to organizational objectives.'}

What excites me most about this opportunity is the chance to work with ${job.company}'s team on ${job.responsibilities[0]?.toLowerCase() || 'challenging projects'}. I am particularly drawn to ${job.company}'s commitment to ${job.benefits[0] || 'excellence'}, which aligns with my professional values.

My key qualifications include:

${job.requirements.slice(0, 4).map(req => `• ${profile.skills.some(s => req.toLowerCase().includes(s.toLowerCase())) ? '✓ ' : ''}${req}`).join('\n')}

${profile.certifications.length > 0 ? `I also hold certifications including ${profile.certifications.slice(0, 2).map(c => c.name).join(' and ')}, which further demonstrate my commitment to professional development.` : ''}

I am eager to bring my skills and enthusiasm to ${job.company} and would welcome the opportunity to discuss how my background aligns with your needs. Thank you for considering my application.

Sincerely,

${user.name}`;

  return {
    id: uuidv4(),
    jobId: job.id,
    userId: profile.userId,
    content,
    createdAt: new Date().toISOString()
  };
}

// Parse CV text (simulated)
export function parseCV(text: string): Partial<Profile> {
  // This is a simplified parser - in production, you'd use AI/ML
  const skills: string[] = [];
  const skillKeywords = [
    'python', 'javascript', 'java', 'c++', 'react', 'node', 'aws', 'azure', 'docker',
    'kubernetes', 'linux', 'windows', 'cisco', 'network', 'security', 'sql', 'mongodb',
    'tcp/ip', 'dhcp', 'dns', 'vpn', 'firewall', 'fortinet', 'aruba', 'vmware',
    'active directory', 'powershell', 'bash', 'git', 'jenkins', 'terraform'
  ];
  
  const textLower = text.toLowerCase();
  skillKeywords.forEach(skill => {
    if (textLower.includes(skill)) {
      skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  return {
    skills: skills.length > 0 ? skills : ['Add your skills'],
    summary: text.substring(0, 300) || 'Professional summary extracted from CV',
  };
}

// Calculate ATS score
export function calculateATSScore(resume: string, job: Job): number {
  const resumeLower = resume.toLowerCase();
  const jobKeywords = [
    ...job.skills,
    ...job.requirements.flatMap(r => r.split(' ')),
  ].map(k => k.toLowerCase()).filter(k => k.length > 3);
  
  const uniqueKeywords = [...new Set(jobKeywords)];
  const matchedCount = uniqueKeywords.filter(keyword => 
    resumeLower.includes(keyword)
  ).length;
  
  return Math.round((matchedCount / uniqueKeywords.length) * 100);
}
