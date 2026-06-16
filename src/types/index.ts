// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  githubUrl: string;
  preferredJobTitles: string[];
  preferredCountries: string[];
  salaryExpectations: {
    min: number;
    max: number;
    currency: string;
  };
  noticePeriod: string;
  visaStatus: string;
  avatar?: string;
  createdAt: Date;
}

export interface Profile {
  userId: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  achievements: string[];
  languages: Language[];
  workAuthorization: string;
  visaSponsorshipRequired: boolean;
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  expectedSalary: {
    min: number;
    max: number;
    currency: string;
  };
  preferredLocations: string[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  institution: string;
  location: string;
  graduationDate: string;
  gpa?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate: string;
  endDate?: string;
}

export interface Language {
  name: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
}

// Job Types
export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  country: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'yearly' | 'monthly' | 'hourly';
  } | null;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote: 'remote' | 'hybrid' | 'onsite';
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  experience: string;
  postedDate: string;
  expiryDate?: string;
  source: 'LinkedIn' | 'Indeed' | 'Jooble' | 'Adzuna' | 'RemoteOK' | 'Jobicy' | 'Greenhouse' | 'Lever' | 'Workday' | 'Direct';
  applicationUrl: string;
  applyType: 'direct' | 'external';
  visaSponsorship: boolean;
  matchScore?: number;
}

export interface JobSearchFilters {
  keyword: string;
  location: string;
  country: string;
  experience: string;
  salaryMin: number;
  salaryMax: number;
  remote: string;
  visaSponsorship: boolean;
  jobType: string;
  source: string;
}

// Application Types
export interface Application {
  id: string;
  jobId: string;
  job: Job;
  userId: string;
  status: 'pending' | 'submitted' | 'redirected' | 'under_review' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  appliedDate: string;
  resumeVersion: string;
  coverLetterVersion: string;
  atsScore: number;
  matchScore: number;
  notes: string;
  timeline: ApplicationEvent[];
}

export interface ApplicationEvent {
  id: string;
  date: string;
  type: 'applied' | 'viewed' | 'interview_scheduled' | 'interview_completed' | 'offer' | 'rejected' | 'withdrawn' | 'note';
  description: string;
}

// Resume Types
export interface TailoredResume {
  id: string;
  jobId: string;
  userId: string;
  originalContent: string;
  tailoredContent: string;
  atsScore: number;
  optimizations: string[];
  keywords: string[];
  createdAt: string;
}

export interface CoverLetter {
  id: string;
  jobId: string;
  userId: string;
  content: string;
  createdAt: string;
}

// Match Analysis Types
export interface MatchAnalysis {
  overallScore: number;
  skillsMatch: {
    score: number;
    matched: string[];
    missing: string[];
  };
  experienceMatch: {
    score: number;
    required: string;
    candidate: string;
  };
  titleMatch: {
    score: number;
    similarity: number;
  };
  locationMatch: {
    score: number;
    compatible: boolean;
  };
  certificationsMatch: {
    score: number;
    matched: string[];
    recommended: string[];
  };
  keywordsMatch: {
    score: number;
    matched: string[];
    missing: string[];
  };
  atsAnalysis: {
    score: number;
    suggestions: string[];
  };
}

// Dashboard Types
export interface DashboardStats {
  jobsFound: number;
  applicationsSent: number;
  averageMatchScore: number;
  interviewRate: number;
  offers: number;
  savedJobs: number;
}
