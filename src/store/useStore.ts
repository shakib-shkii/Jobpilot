import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Profile, Job, Application, JobSearchFilters, TailoredResume, CoverLetter } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { mockJobs } from '../data/mockJobs';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  isAdmin: boolean;
  
  // Profile
  profile: Profile | null;
  cvUploaded: boolean;
  cvFileName: string | null;
  
  // Jobs
  jobs: Job[];
  savedJobs: string[];
  searchFilters: JobSearchFilters;
  
  // Applications
  applications: Application[];
  
  // Generated Documents
  tailoredResumes: TailoredResume[];
  coverLetters: CoverLetter[];
  
  // UI State
  sidebarOpen: boolean;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  register: (userData: Partial<User>) => User;
  updateUser: (userData: Partial<User>) => void;
  updateProfile: (profileData: Partial<Profile>) => void;
  uploadCV: (fileName: string, extractedData: Partial<Profile>) => void;
  
  setSearchFilters: (filters: Partial<JobSearchFilters>) => void;
  searchJobs: () => Job[];
  saveJob: (jobId: string) => void;
  unsaveJob: (jobId: string) => void;
  
  applyToJob: (job: Job, resume: TailoredResume, coverLetter: CoverLetter) => Application;
  updateApplicationStatus: (applicationId: string, status: Application['status']) => void;
  addApplicationNote: (applicationId: string, note: string) => void;
  
  saveTailoredResume: (resume: TailoredResume) => void;
  saveCoverLetter: (coverLetter: CoverLetter) => void;
  
  toggleSidebar: () => void;
}

const defaultSearchFilters: JobSearchFilters = {
  keyword: '',
  location: '',
  country: '',
  experience: '',
  salaryMin: 0,
  salaryMax: 500000,
  remote: '',
  visaSponsorship: false,
  jobType: '',
  source: '',
};

const defaultProfile: Profile = {
  userId: '',
  summary: '',
  skills: [],
  experience: [],
  education: [],
  certifications: [],
  projects: [],
  achievements: [],
  languages: [],
  workAuthorization: '',
  visaSponsorshipRequired: false,
  remotePreference: 'flexible',
  expectedSalary: { min: 0, max: 0, currency: 'USD' },
  preferredLocations: [],
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      isAuthenticated: false,
      currentUser: null,
      isAdmin: false,
      profile: null,
      cvUploaded: false,
      cvFileName: null,
      jobs: mockJobs,
      savedJobs: [],
      searchFilters: defaultSearchFilters,
      applications: [],
      tailoredResumes: [],
      coverLetters: [],
      sidebarOpen: true,
      
      // Auth Actions
      login: (user) => set({ 
        isAuthenticated: true, 
        currentUser: user,
        isAdmin: user.email === 'admin@jobpilot.ai',
        profile: { ...defaultProfile, userId: user.id }
      }),
      
      logout: () => set({ 
        isAuthenticated: false, 
        currentUser: null, 
        isAdmin: false,
        profile: null,
        cvUploaded: false,
        cvFileName: null,
      }),
      
      register: (userData) => {
        const newUser: User = {
          id: uuidv4(),
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          linkedinUrl: userData.linkedinUrl || '',
          portfolioUrl: userData.portfolioUrl || '',
          githubUrl: userData.githubUrl || '',
          preferredJobTitles: userData.preferredJobTitles || [],
          preferredCountries: userData.preferredCountries || [],
          salaryExpectations: userData.salaryExpectations || { min: 0, max: 0, currency: 'USD' },
          noticePeriod: userData.noticePeriod || '',
          visaStatus: userData.visaStatus || '',
          createdAt: new Date(),
        };
        
        set({ 
          isAuthenticated: true, 
          currentUser: newUser,
          isAdmin: newUser.email === 'admin@jobpilot.ai',
          profile: { ...defaultProfile, userId: newUser.id }
        });
        
        return newUser;
      },
      
      updateUser: (userData) => set((state) => ({
        currentUser: state.currentUser 
          ? { ...state.currentUser, ...userData }
          : null
      })),
      
      updateProfile: (profileData) => set((state) => ({
        profile: state.profile 
          ? { ...state.profile, ...profileData }
          : null
      })),
      
      uploadCV: (fileName, extractedData) => set((state) => ({
        cvUploaded: true,
        cvFileName: fileName,
        profile: state.profile 
          ? { ...state.profile, ...extractedData }
          : null,
        currentUser: state.currentUser && extractedData
          ? {
              ...state.currentUser,
              name: extractedData.summary ? state.currentUser.name : state.currentUser.name,
            }
          : state.currentUser
      })),
      
      // Job Actions
      setSearchFilters: (filters) => set((state) => ({
        searchFilters: { ...state.searchFilters, ...filters }
      })),
      
      searchJobs: () => {
        const { jobs, searchFilters, profile } = get();
        
        let filteredJobs = [...jobs];
        
        if (searchFilters.keyword) {
          const keyword = searchFilters.keyword.toLowerCase();
          filteredJobs = filteredJobs.filter(job => 
            job.title.toLowerCase().includes(keyword) ||
            job.company.toLowerCase().includes(keyword) ||
            job.description.toLowerCase().includes(keyword) ||
            job.skills.some(skill => skill.toLowerCase().includes(keyword))
          );
        }
        
        if (searchFilters.location) {
          const location = searchFilters.location.toLowerCase();
          filteredJobs = filteredJobs.filter(job => 
            job.location.toLowerCase().includes(location)
          );
        }
        
        if (searchFilters.country) {
          filteredJobs = filteredJobs.filter(job => 
            job.country.toLowerCase() === searchFilters.country.toLowerCase()
          );
        }
        
        if (searchFilters.remote) {
          filteredJobs = filteredJobs.filter(job => 
            job.remote === searchFilters.remote
          );
        }
        
        if (searchFilters.jobType) {
          filteredJobs = filteredJobs.filter(job => 
            job.type === searchFilters.jobType
          );
        }
        
        if (searchFilters.visaSponsorship) {
          filteredJobs = filteredJobs.filter(job => job.visaSponsorship);
        }
        
        if (searchFilters.source) {
          filteredJobs = filteredJobs.filter(job => 
            job.source === searchFilters.source
          );
        }
        
        // Calculate match scores
        if (profile && profile.skills.length > 0) {
          filteredJobs = filteredJobs.map(job => ({
            ...job,
            matchScore: calculateMatchScore(job, profile)
          }));
        }
        
        // Sort by match score
        filteredJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        
        return filteredJobs;
      },
      
      saveJob: (jobId) => set((state) => ({
        savedJobs: [...state.savedJobs, jobId]
      })),
      
      unsaveJob: (jobId) => set((state) => ({
        savedJobs: state.savedJobs.filter(id => id !== jobId)
      })),
      
      // Application Actions
      applyToJob: (job, resume, coverLetter) => {
        const application: Application = {
          id: uuidv4(),
          jobId: job.id,
          job,
          userId: get().currentUser?.id || '',
          status: job.applyType === 'direct' ? 'submitted' : 'redirected',
          appliedDate: new Date().toISOString(),
          resumeVersion: resume.id,
          coverLetterVersion: coverLetter.id,
          atsScore: resume.atsScore,
          matchScore: job.matchScore || 0,
          notes: '',
          timeline: [{
            id: uuidv4(),
            date: new Date().toISOString(),
            type: 'applied',
            description: job.applyType === 'direct' 
              ? 'Application submitted successfully'
              : 'Redirected to external application page'
          }]
        };
        
        set((state) => ({
          applications: [...state.applications, application]
        }));
        
        return application;
      },
      
      updateApplicationStatus: (applicationId, status) => set((state) => ({
        applications: state.applications.map(app => 
          app.id === applicationId 
            ? { 
                ...app, 
                status,
                timeline: [...app.timeline, {
                  id: uuidv4(),
                  date: new Date().toISOString(),
                  type: status as any,
                  description: `Status updated to ${status}`
                }]
              }
            : app
        )
      })),
      
      addApplicationNote: (applicationId, note) => set((state) => ({
        applications: state.applications.map(app => 
          app.id === applicationId 
            ? { 
                ...app, 
                notes: app.notes + '\n' + note,
                timeline: [...app.timeline, {
                  id: uuidv4(),
                  date: new Date().toISOString(),
                  type: 'note',
                  description: note
                }]
              }
            : app
        )
      })),
      
      // Document Actions
      saveTailoredResume: (resume) => set((state) => ({
        tailoredResumes: [...state.tailoredResumes, resume]
      })),
      
      saveCoverLetter: (coverLetter) => set((state) => ({
        coverLetters: [...state.coverLetters, coverLetter]
      })),
      
      // UI Actions
      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
      })),
    }),
    {
      name: 'jobpilot-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        isAdmin: state.isAdmin,
        profile: state.profile,
        cvUploaded: state.cvUploaded,
        cvFileName: state.cvFileName,
        savedJobs: state.savedJobs,
        applications: state.applications,
        tailoredResumes: state.tailoredResumes,
        coverLetters: state.coverLetters,
      })
    }
  )
);

// Helper function to calculate match score
function calculateMatchScore(job: Job, profile: Profile): number {
  let totalScore = 0;
  let weights = {
    skills: 40,
    experience: 25,
    location: 15,
    certifications: 10,
    keywords: 10
  };
  
  // Skills match
  const jobSkills = job.skills.map(s => s.toLowerCase());
  const profileSkills = profile.skills.map(s => s.toLowerCase());
  const matchedSkills = jobSkills.filter(skill => 
    profileSkills.some(ps => ps.includes(skill) || skill.includes(ps))
  );
  const skillsScore = jobSkills.length > 0 
    ? (matchedSkills.length / jobSkills.length) * weights.skills
    : weights.skills * 0.5;
  
  // Experience match (simplified)
  const expScore = profile.experience.length > 0 ? weights.experience * 0.8 : weights.experience * 0.3;
  
  // Location match
  const locationScore = profile.preferredLocations.some(loc => 
    job.location.toLowerCase().includes(loc.toLowerCase()) ||
    job.country.toLowerCase().includes(loc.toLowerCase())
  ) ? weights.location : weights.location * 0.5;
  
  // Certifications match
  const certScore = profile.certifications.length > 0 ? weights.certifications * 0.7 : weights.certifications * 0.3;
  
  // Keywords match
  const keywordScore = weights.keywords * 0.7;
  
  totalScore = skillsScore + expScore + locationScore + certScore + keywordScore;
  
  return Math.round(totalScore);
}
