// Job Search API Service
// Integrates with multiple job platforms: JSearch (RapidAPI), Adzuna, RemoteOK, etc.

import { Job } from '../types';
import { v4 as uuidv4 } from 'uuid';

// API Configuration - Users need to add their own API keys
export interface APIConfig {
  jsearch: {
    enabled: boolean;
    apiKey: string; // RapidAPI key for JSearch
  };
  adzuna: {
    enabled: boolean;
    appId: string;
    appKey: string;
  };
  remoteok: {
    enabled: boolean; // Free, no key required
  };
  usajobs: {
    enabled: boolean;
    apiKey: string;
    userAgent: string;
  };
  themuse: {
    enabled: boolean;
    apiKey: string;
  };
}

// Default config - stored in localStorage
const DEFAULT_CONFIG: APIConfig = {
  jsearch: { enabled: false, apiKey: '' },
  adzuna: { enabled: false, appId: '', appKey: '' },
  remoteok: { enabled: true }, // Free API, always enabled
  usajobs: { enabled: false, apiKey: '', userAgent: '' },
  themuse: { enabled: false, apiKey: '' },
};

export function getAPIConfig(): APIConfig {
  const saved = localStorage.getItem('jobpilot_api_config');
  if (saved) {
    return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  }
  return DEFAULT_CONFIG;
}

export function saveAPIConfig(config: APIConfig): void {
  localStorage.setItem('jobpilot_api_config', JSON.stringify(config));
}

// JSearch API (RapidAPI) - Aggregates from LinkedIn, Indeed, Glassdoor, ZipRecruiter
export async function searchJSearch(
  query: string,
  location: string = '',
  options: {
    page?: number;
    numPages?: number;
    datePosted?: 'all' | 'today' | '3days' | 'week' | 'month';
    remoteOnly?: boolean;
    employmentTypes?: string[];
  } = {}
): Promise<Job[]> {
  const config = getAPIConfig();
  if (!config.jsearch.enabled || !config.jsearch.apiKey) {
    console.log('JSearch API not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      query: location ? `${query} in ${location}` : query,
      page: String(options.page || 1),
      num_pages: String(options.numPages || 1),
      date_posted: options.datePosted || 'all',
    });

    if (options.remoteOnly) {
      params.append('remote_jobs_only', 'true');
    }

    if (options.employmentTypes?.length) {
      params.append('employment_types', options.employmentTypes.join(','));
    }

    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?${params.toString()}`,
      {
        headers: {
          'X-RapidAPI-Key': config.jsearch.apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`JSearch API error: ${response.status}`);
    }

    const data = await response.json();
    
    return (data.data || []).map((job: any) => mapJSearchJob(job));
  } catch (error) {
    console.error('JSearch API error:', error);
    return [];
  }
}

function mapJSearchJob(job: any): Job {
  return {
    id: uuidv4(),
    title: job.job_title || 'Untitled',
    company: job.employer_name || 'Unknown Company',
    companyLogo: job.employer_logo || '',
    location: job.job_city ? `${job.job_city}, ${job.job_state || ''}` : job.job_country || 'Remote',
    country: job.job_country || 'Unknown',
    salary: job.job_min_salary && job.job_max_salary ? {
      min: job.job_min_salary,
      max: job.job_max_salary,
      currency: job.job_salary_currency || 'USD',
      period: job.job_salary_period === 'YEAR' ? 'yearly' : 'monthly',
    } : null,
    type: mapEmploymentType(job.job_employment_type),
    remote: job.job_is_remote ? 'remote' : 'onsite',
    description: job.job_description || '',
    requirements: job.job_required_skills || [],
    responsibilities: job.job_highlights?.Responsibilities || [],
    benefits: job.job_highlights?.Benefits || [],
    skills: job.job_required_skills || [],
    experience: job.job_required_experience?.required_experience_in_months 
      ? `${Math.floor(job.job_required_experience.required_experience_in_months / 12)}+ years`
      : 'Not specified',
    postedDate: job.job_posted_at_datetime_utc || new Date().toISOString(),
    source: mapJobSource(job.job_publisher),
    applicationUrl: job.job_apply_link || '',
    applyType: job.job_apply_is_direct ? 'direct' : 'external',
    visaSponsorship: false, // JSearch doesn't provide this
  };
}

// Adzuna API - Free tier available
export async function searchAdzuna(
  query: string,
  country: string = 'us',
  options: {
    page?: number;
    resultsPerPage?: number;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    full_time?: boolean;
    permanent?: boolean;
  } = {}
): Promise<Job[]> {
  const config = getAPIConfig();
  if (!config.adzuna.enabled || !config.adzuna.appId || !config.adzuna.appKey) {
    console.log('Adzuna API not configured');
    return [];
  }

  try {
    // Map country to Adzuna country code
    const countryCode = getAdzunaCountryCode(country);
    
    const params = new URLSearchParams({
      app_id: config.adzuna.appId,
      app_key: config.adzuna.appKey,
      results_per_page: String(options.resultsPerPage || 20),
      what: query,
      'content-type': 'application/json',
    });

    if (options.location) {
      params.append('where', options.location);
    }
    if (options.salary_min) {
      params.append('salary_min', String(options.salary_min));
    }
    if (options.salary_max) {
      params.append('salary_max', String(options.salary_max));
    }
    if (options.full_time) {
      params.append('full_time', '1');
    }
    if (options.permanent) {
      params.append('permanent', '1');
    }

    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/${options.page || 1}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = await response.json();
    
    return (data.results || []).map((job: any) => mapAdzunaJob(job, country));
  } catch (error) {
    console.error('Adzuna API error:', error);
    return [];
  }
}

function getAdzunaCountryCode(country: string): string {
  const codes: Record<string, string> = {
    'united states': 'us', 'usa': 'us', 'us': 'us',
    'united kingdom': 'gb', 'uk': 'gb', 'gb': 'gb',
    'canada': 'ca', 'australia': 'au', 'germany': 'de',
    'france': 'fr', 'netherlands': 'nl', 'india': 'in',
    'singapore': 'sg', 'south africa': 'za', 'brazil': 'br',
    'austria': 'at', 'belgium': 'be', 'switzerland': 'ch',
    'italy': 'it', 'new zealand': 'nz', 'poland': 'pl',
    'russia': 'ru', 'mexico': 'mx',
  };
  return codes[country.toLowerCase()] || 'us';
}

function mapAdzunaJob(job: any, country: string): Job {
  return {
    id: uuidv4(),
    title: job.title || 'Untitled',
    company: job.company?.display_name || 'Unknown Company',
    companyLogo: '',
    location: job.location?.display_name || 'Unknown',
    country: country,
    salary: job.salary_min && job.salary_max ? {
      min: job.salary_min,
      max: job.salary_max,
      currency: getCurrencyByCountry(country),
      period: 'yearly',
    } : null,
    type: job.contract_time === 'full_time' ? 'full-time' : job.contract_time === 'part_time' ? 'part-time' : 'full-time',
    remote: job.title?.toLowerCase().includes('remote') ? 'remote' : 'onsite',
    description: job.description || '',
    requirements: [],
    responsibilities: [],
    benefits: [],
    skills: extractSkillsFromDescription(job.description || ''),
    experience: 'Not specified',
    postedDate: job.created || new Date().toISOString(),
    source: 'Adzuna',
    applicationUrl: job.redirect_url || '',
    applyType: 'external',
    visaSponsorship: false,
  };
}

// RemoteOK API - Free, no API key required
export async function searchRemoteOK(query: string = ''): Promise<Job[]> {
  const config = getAPIConfig();
  if (!config.remoteok.enabled) {
    return [];
  }

  try {
    // RemoteOK has CORS issues, so we use a proxy or handle it differently
    // For demo purposes, return empty - in production use a backend proxy
    const response = await fetch('https://remoteok.com/api?tag=' + encodeURIComponent(query), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // RemoteOK often has CORS issues - fallback to empty
      console.log('RemoteOK API not accessible (CORS)');
      return [];
    }

    const data = await response.json();
    
    // First item is usually legal text, skip it
    const jobs = Array.isArray(data) ? data.slice(1) : [];
    
    return jobs.map((job: any) => mapRemoteOKJob(job));
  } catch (error) {
    console.error('RemoteOK API error:', error);
    return [];
  }
}

function mapRemoteOKJob(job: any): Job {
  return {
    id: uuidv4(),
    title: job.position || 'Untitled',
    company: job.company || 'Unknown Company',
    companyLogo: job.company_logo || '',
    location: job.location || 'Remote',
    country: 'Worldwide',
    salary: job.salary_min && job.salary_max ? {
      min: parseInt(job.salary_min),
      max: parseInt(job.salary_max),
      currency: 'USD',
      period: 'yearly',
    } : null,
    type: 'full-time',
    remote: 'remote',
    description: job.description || '',
    requirements: [],
    responsibilities: [],
    benefits: [],
    skills: job.tags || [],
    experience: 'Not specified',
    postedDate: job.date ? new Date(job.date * 1000).toISOString() : new Date().toISOString(),
    source: 'RemoteOK',
    applicationUrl: job.url || `https://remoteok.com/l/${job.id}`,
    applyType: 'external',
    visaSponsorship: false,
  };
}

// USA Jobs API - US Government jobs
export async function searchUSAJobs(
  query: string,
  location: string = '',
  options: { page?: number; resultsPerPage?: number } = {}
): Promise<Job[]> {
  const config = getAPIConfig();
  if (!config.usajobs.enabled || !config.usajobs.apiKey) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      Keyword: query,
      ResultsPerPage: String(options.resultsPerPage || 25),
      Page: String(options.page || 1),
    });

    if (location) {
      params.append('LocationName', location);
    }

    const response = await fetch(
      `https://data.usajobs.gov/api/search?${params.toString()}`,
      {
        headers: {
          'Authorization-Key': config.usajobs.apiKey,
          'User-Agent': config.usajobs.userAgent || 'jobpilot@example.com',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`USAJobs API error: ${response.status}`);
    }

    const data = await response.json();
    
    return (data.SearchResult?.SearchResultItems || []).map((item: any) => 
      mapUSAJobsJob(item.MatchedObjectDescriptor)
    );
  } catch (error) {
    console.error('USAJobs API error:', error);
    return [];
  }
}

function mapUSAJobsJob(job: any): Job {
  return {
    id: uuidv4(),
    title: job.PositionTitle || 'Untitled',
    company: job.OrganizationName || 'US Government',
    companyLogo: '',
    location: job.PositionLocationDisplay || 'USA',
    country: 'USA',
    salary: job.PositionRemuneration?.[0] ? {
      min: parseInt(job.PositionRemuneration[0].MinimumRange) || 0,
      max: parseInt(job.PositionRemuneration[0].MaximumRange) || 0,
      currency: 'USD',
      period: job.PositionRemuneration[0].RateIntervalCode === 'Per Year' ? 'yearly' : 'monthly',
    } : null,
    type: 'full-time',
    remote: job.PositionLocationDisplay?.toLowerCase().includes('remote') ? 'remote' : 'onsite',
    description: job.UserArea?.Details?.JobSummary || job.QualificationSummary || '',
    requirements: [],
    responsibilities: [],
    benefits: ['Federal Benefits', 'Pension', 'Health Insurance'],
    skills: [],
    experience: job.UserArea?.Details?.LowGrade || 'Not specified',
    postedDate: job.PublicationStartDate || new Date().toISOString(),
    source: 'Direct',
    applicationUrl: job.ApplyURI?.[0] || '',
    applyType: 'external',
    visaSponsorship: false,
  };
}

// The Muse API
export async function searchTheMuse(
  query: string,
  options: { page?: number; level?: string; location?: string } = {}
): Promise<Job[]> {
  const config = getAPIConfig();
  if (!config.themuse.enabled || !config.themuse.apiKey) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      api_key: config.themuse.apiKey,
      page: String(options.page || 1),
      descending: 'true',
    });

    if (query) {
      params.append('category', query);
    }
    if (options.level) {
      params.append('level', options.level);
    }
    if (options.location) {
      params.append('location', options.location);
    }

    const response = await fetch(
      `https://www.themuse.com/api/public/jobs?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`The Muse API error: ${response.status}`);
    }

    const data = await response.json();
    
    return (data.results || []).map((job: any) => mapTheMuseJob(job));
  } catch (error) {
    console.error('The Muse API error:', error);
    return [];
  }
}

function mapTheMuseJob(job: any): Job {
  const location = job.locations?.[0]?.name || 'Remote';
  return {
    id: uuidv4(),
    title: job.name || 'Untitled',
    company: job.company?.name || 'Unknown Company',
    companyLogo: job.company?.logo || '',
    location: location,
    country: extractCountryFromLocation(location),
    salary: null,
    type: 'full-time',
    remote: location.toLowerCase().includes('remote') ? 'remote' : 'onsite',
    description: job.contents || '',
    requirements: [],
    responsibilities: [],
    benefits: [],
    skills: job.categories?.map((c: any) => c.name) || [],
    experience: job.levels?.[0]?.name || 'Not specified',
    postedDate: job.publication_date || new Date().toISOString(),
    source: 'Direct',
    applicationUrl: job.refs?.landing_page || '',
    applyType: 'external',
    visaSponsorship: false,
  };
}

// Unified search across all APIs
export async function searchAllPlatforms(
  query: string,
  options: {
    location?: string;
    country?: string;
    page?: number;
    remoteOnly?: boolean;
  } = {}
): Promise<Job[]> {
  const results: Job[] = [];
  
  // Run all searches in parallel
  const [jsearchResults, adzunaResults, remoteokResults] = await Promise.allSettled([
    searchJSearch(query, options.location || '', {
      page: options.page,
      remoteOnly: options.remoteOnly,
    }),
    searchAdzuna(query, options.country || 'us', {
      page: options.page,
      location: options.location,
    }),
    searchRemoteOK(query),
  ]);

  // Collect successful results
  if (jsearchResults.status === 'fulfilled') {
    results.push(...jsearchResults.value);
  }
  if (adzunaResults.status === 'fulfilled') {
    results.push(...adzunaResults.value);
  }
  if (remoteokResults.status === 'fulfilled') {
    results.push(...remoteokResults.value);
  }

  // Deduplicate by title + company
  const seen = new Set<string>();
  const uniqueResults = results.filter(job => {
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniqueResults;
}

// Helper functions
function mapEmploymentType(type: string): Job['type'] {
  const lowerType = (type || '').toLowerCase();
  if (lowerType.includes('full')) return 'full-time';
  if (lowerType.includes('part')) return 'part-time';
  if (lowerType.includes('contract') || lowerType.includes('contractor')) return 'contract';
  if (lowerType.includes('intern')) return 'internship';
  return 'full-time';
}

function mapJobSource(publisher: string): Job['source'] {
  const lowerPub = (publisher || '').toLowerCase();
  if (lowerPub.includes('linkedin')) return 'LinkedIn';
  if (lowerPub.includes('indeed')) return 'Indeed';
  if (lowerPub.includes('glassdoor')) return 'Jooble';
  if (lowerPub.includes('ziprecruiter')) return 'Adzuna';
  if (lowerPub.includes('greenhouse')) return 'Greenhouse';
  if (lowerPub.includes('lever')) return 'Lever';
  if (lowerPub.includes('workday')) return 'Workday';
  return 'Direct';
}

function getCurrencyByCountry(country: string): string {
  const currencies: Record<string, string> = {
    'us': 'USD', 'united states': 'USD', 'usa': 'USD',
    'gb': 'GBP', 'uk': 'GBP', 'united kingdom': 'GBP',
    'de': 'EUR', 'germany': 'EUR', 'fr': 'EUR', 'france': 'EUR',
    'nl': 'EUR', 'netherlands': 'EUR',
    'ca': 'CAD', 'canada': 'CAD',
    'au': 'AUD', 'australia': 'AUD',
    'in': 'INR', 'india': 'INR',
    'sg': 'SGD', 'singapore': 'SGD',
    'ae': 'AED', 'uae': 'AED',
    'sa': 'SAR', 'saudi arabia': 'SAR',
  };
  return currencies[country.toLowerCase()] || 'USD';
}

function extractCountryFromLocation(location: string): string {
  const countryPatterns: Record<string, string> = {
    'united states': 'USA', 'usa': 'USA', 'us': 'USA',
    'united kingdom': 'United Kingdom', 'uk': 'United Kingdom',
    'canada': 'Canada', 'australia': 'Australia',
    'germany': 'Germany', 'france': 'France',
    'remote': 'Worldwide',
  };
  
  const lowerLocation = location.toLowerCase();
  for (const [pattern, country] of Object.entries(countryPatterns)) {
    if (lowerLocation.includes(pattern)) {
      return country;
    }
  }
  return 'Unknown';
}

function extractSkillsFromDescription(description: string): string[] {
  const skillKeywords = [
    'python', 'javascript', 'java', 'c++', 'react', 'node', 'aws', 'azure',
    'docker', 'kubernetes', 'linux', 'sql', 'mongodb', 'cisco', 'network',
    'security', 'tcp/ip', 'dhcp', 'dns', 'firewall', 'vmware', 'devops',
    'terraform', 'ansible', 'git', 'agile', 'scrum',
  ];
  
  const descLower = description.toLowerCase();
  return skillKeywords.filter(skill => descLower.includes(skill))
    .map(skill => skill.charAt(0).toUpperCase() + skill.slice(1));
}
