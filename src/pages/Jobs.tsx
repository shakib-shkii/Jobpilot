import { useState, useMemo } from 'react';
import { 
  Search, MapPin, Building2, Clock, Bookmark, BookmarkCheck,
  Filter, Sparkles, X, Globe, DollarSign, Briefcase, RefreshCw, Wifi
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Job } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { JobDetailModal } from '../components/Jobs/JobDetailModal';
import { searchAllPlatforms, getAPIConfig } from '../services/jobApis';

const countries = [
  '', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
  'United States', 'United Kingdom', 'Germany', 'Netherlands', 'Singapore', 'Worldwide'
];

const remoteOptions = ['', 'remote', 'hybrid', 'onsite'];
const jobTypes = ['', 'full-time', 'part-time', 'contract', 'internship'];
const sources = ['', 'LinkedIn', 'Indeed', 'Jooble', 'Adzuna', 'RemoteOK', 'Jobicy', 'Greenhouse', 'Lever', 'Workday', 'Direct'];

export function Jobs() {
  const { jobs, searchFilters, setSearchFilters, savedJobs, saveJob, unsaveJob, profile } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sortBy, setSortBy] = useState<'match' | 'date' | 'salary'>('match');
  const [liveJobs, setLiveJobs] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'local' | 'live'>('local');
  
  // Check if any API is configured
  const apiConfig = getAPIConfig();
  const hasApisConfigured = apiConfig.jsearch.enabled || apiConfig.adzuna.enabled || apiConfig.remoteok.enabled;

  // Search live APIs
  const handleLiveSearch = async () => {
    if (!searchFilters.keyword) {
      alert('Please enter a keyword to search');
      return;
    }
    
    setIsSearching(true);
    setSearchMode('live');
    
    try {
      const results = await searchAllPlatforms(searchFilters.keyword, {
        location: searchFilters.location,
        country: searchFilters.country,
        remoteOnly: searchFilters.remote === 'remote',
      });
      
      // Add match scores to live results
      const resultsWithScores = results.map(job => {
        if (profile && profile.skills.length > 0) {
          const jobSkills = job.skills.map(s => s.toLowerCase());
          const profileSkills = profile.skills.map(s => s.toLowerCase());
          const matchedSkills = jobSkills.filter(skill =>
            profileSkills.some(ps => ps.includes(skill) || skill.includes(ps))
          );
          const score = jobSkills.length > 0
            ? Math.round((matchedSkills.length / jobSkills.length) * 100)
            : 50;
          return { ...job, matchScore: Math.min(98, score + Math.floor(Math.random() * 15)) };
        }
        return { ...job, matchScore: Math.floor(Math.random() * 40) + 45 };
      });
      
      setLiveJobs(resultsWithScores);
    } catch (error) {
      console.error('Live search error:', error);
    }
    
    setIsSearching(false);
  };

  // Calculate match scores for jobs
  const jobsWithScores = useMemo(() => {
    return jobs.map(job => {
      if (profile && profile.skills.length > 0) {
        const jobSkills = job.skills.map(s => s.toLowerCase());
        const profileSkills = profile.skills.map(s => s.toLowerCase());
        const matchedSkills = jobSkills.filter(skill =>
          profileSkills.some(ps => ps.includes(skill) || skill.includes(ps))
        );
        const score = jobSkills.length > 0
          ? Math.round((matchedSkills.length / jobSkills.length) * 100)
          : 50;
        return { ...job, matchScore: Math.min(98, score + Math.floor(Math.random() * 20)) };
      }
      return { ...job, matchScore: Math.floor(Math.random() * 40) + 50 };
    });
  }, [jobs, profile]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobsWithScores];

    if (searchFilters.keyword) {
      const keyword = searchFilters.keyword.toLowerCase();
      result = result.filter(job =>
        job.title.toLowerCase().includes(keyword) ||
        job.company.toLowerCase().includes(keyword) ||
        job.description.toLowerCase().includes(keyword) ||
        job.skills.some(skill => skill.toLowerCase().includes(keyword))
      );
    }

    if (searchFilters.location) {
      const location = searchFilters.location.toLowerCase();
      result = result.filter(job =>
        job.location.toLowerCase().includes(location)
      );
    }

    if (searchFilters.country) {
      result = result.filter(job =>
        job.country.toLowerCase() === searchFilters.country.toLowerCase()
      );
    }

    if (searchFilters.remote) {
      result = result.filter(job => job.remote === searchFilters.remote);
    }

    if (searchFilters.jobType) {
      result = result.filter(job => job.type === searchFilters.jobType);
    }

    if (searchFilters.visaSponsorship) {
      result = result.filter(job => job.visaSponsorship);
    }

    if (searchFilters.source) {
      result = result.filter(job => job.source === searchFilters.source);
    }

    // Sort
    switch (sortBy) {
      case 'match':
        result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case 'date':
        result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        break;
      case 'salary':
        result.sort((a, b) => {
          const salaryA = a.salary?.max || 0;
          const salaryB = b.salary?.max || 0;
          return salaryB - salaryA;
        });
        break;
    }

    return result;
  }, [jobsWithScores, searchFilters, sortBy]);

  // Combine local and live jobs
  const allJobs = searchMode === 'live' && liveJobs.length > 0 ? liveJobs : filteredJobs;

  const clearFilters = () => {
    setSearchFilters({
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
    });
  };

  const hasActiveFilters = searchFilters.keyword || searchFilters.location || 
    searchFilters.country || searchFilters.remote || searchFilters.jobType || 
    searchFilters.visaSponsorship || searchFilters.source;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchFilters.keyword}
              onChange={(e) => setSearchFilters({ keyword: e.target.value })}
              placeholder="Job title, keyword, or company"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchFilters.location}
              onChange={(e) => setSearchFilters({ location: e.target.value })}
              placeholder="City, state, or country"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            <button
              onClick={() => setSearchMode('local')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Search
            </button>
            
            {hasApisConfigured && (
              <button
                onClick={handleLiveSearch}
                disabled={isSearching}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
                title="Search real-time from connected APIs"
              >
                {isSearching ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Wifi className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">Live</span>
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Country</label>
                <select
                  value={searchFilters.country}
                  onChange={(e) => setSearchFilters({ country: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                >
                  <option value="">All Countries</option>
                  {countries.filter(c => c).map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Work Type</label>
                <select
                  value={searchFilters.remote}
                  onChange={(e) => setSearchFilters({ remote: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none capitalize"
                >
                  <option value="">All Types</option>
                  {remoteOptions.filter(r => r).map(remote => (
                    <option key={remote} value={remote} className="capitalize">{remote}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Job Type</label>
                <select
                  value={searchFilters.jobType}
                  onChange={(e) => setSearchFilters({ jobType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none capitalize"
                >
                  <option value="">All</option>
                  {jobTypes.filter(t => t).map(type => (
                    <option key={type} value={type} className="capitalize">{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Source</label>
                <select
                  value={searchFilters.source}
                  onChange={(e) => setSearchFilters({ source: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                >
                  <option value="">All Sources</option>
                  {sources.filter(s => s).map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchFilters.visaSponsorship}
                    onChange={(e) => setSearchFilters({ visaSponsorship: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">Visa Sponsorship</span>
                </label>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {allJobs.length} Jobs Found
            {searchMode === 'live' && liveJobs.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                Live Results
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500">
            {searchMode === 'live' && liveJobs.length > 0
              ? 'Real-time results from connected job APIs'
              : 'Showing jobs from LinkedIn, Indeed, Jooble, and 7+ more platforms'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'match' | 'date' | 'salary')}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
            >
              <option value="match">Match Score</option>
              <option value="date">Most Recent</option>
              <option value="salary">Highest Salary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid gap-4">
        {allJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSaved={savedJobs.includes(job.id)}
            onSave={() => saveJob(job.id)}
            onUnsave={() => unsaveJob(job.id)}
            onClick={() => setSelectedJob(job)}
          />
        ))}
      </div>

      {allJobs.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
          <p className="text-slate-500 mb-4">Try adjusting your search filters</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  onSave: () => void;
  onUnsave: () => void;
  onClick: () => void;
}

function JobCard({ job, isSaved, onSave, onUnsave, onClick }: JobCardProps) {
  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-500/10';
    if (score >= 60) return 'text-yellow-600 bg-yellow-500/10';
    return 'text-slate-600 bg-slate-100';
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      LinkedIn: 'bg-blue-500',
      Indeed: 'bg-purple-500',
      Jooble: 'bg-cyan-500',
      Adzuna: 'bg-green-500',
      RemoteOK: 'bg-orange-500',
      Jobicy: 'bg-pink-500',
      Greenhouse: 'bg-emerald-500',
      Lever: 'bg-indigo-500',
      Workday: 'bg-red-500',
      Direct: 'bg-slate-500',
    };
    return colors[source] || 'bg-slate-500';
  };

  return (
    <div 
      className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Company Logo Placeholder */}
        <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="w-7 h-7 text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg text-slate-900">{job.title}</h3>
                {job.matchScore && job.matchScore >= 85 && (
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs font-medium rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Great Match
                  </span>
                )}
              </div>
              <p className="text-slate-600 mt-1">{job.company}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Match Score */}
              {job.matchScore && (
                <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center ${getMatchColor(job.matchScore)}`}>
                  <span className="font-bold text-lg">{job.matchScore}</span>
                  <span className="text-[10px] -mt-1">match</span>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isSaved ? onUnsave() : onSave();
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-slate-100 text-slate-400'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Job Details */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}, {job.country}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span className="capitalize">{job.type}</span>
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span className="capitalize">{job.remote}</span>
            </span>
            {job.salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}
            </span>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {job.skills.slice(0, 6).map((skill) => (
              <span 
                key={skill} 
                className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 6 && (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs rounded-lg">
                +{job.skills.length - 6} more
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${getSourceColor(job.source)}`} />
              <span className="text-sm text-slate-500">via {job.source}</span>
              {job.visaSponsorship && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                  Visa Sponsorship
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                job.applyType === 'direct' 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-orange-50 text-orange-600'
              }`}>
                {job.applyType === 'direct' ? 'Quick Apply' : 'External Apply'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
