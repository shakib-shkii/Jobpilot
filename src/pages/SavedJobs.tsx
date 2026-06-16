import { useState } from 'react';
import { 
  Bookmark, Building2, MapPin, Clock, Trash2, ExternalLink,
  Briefcase, DollarSign, Globe, Sparkles
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Job } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { JobDetailModal } from '../components/Jobs/JobDetailModal';

export function SavedJobs() {
  const { jobs, savedJobs, unsaveJob } = useStore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const savedJobsList = jobs.filter(job => savedJobs.includes(job.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Saved Jobs</h2>
              <p className="text-slate-500">{savedJobsList.length} jobs saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {savedJobsList.length > 0 ? (
        <div className="grid gap-4">
          {savedJobsList.map((job) => (
            <div 
              key={job.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-slate-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div 
                      className="cursor-pointer"
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-slate-900 hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        {job.matchScore && job.matchScore >= 80 && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Great Match
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">{job.company}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {job.matchScore && (
                        <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center text-sm ${
                          job.matchScore >= 80 ? 'bg-green-50 text-green-600' : 
                          job.matchScore >= 60 ? 'bg-yellow-50 text-yellow-600' : 
                          'bg-slate-50 text-slate-600'
                        }`}>
                          <span className="font-bold">{job.matchScore}%</span>
                        </div>
                      )}
                      <button
                        onClick={() => unsaveJob(job.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

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

                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.skills.slice(0, 5).map((skill) => (
                      <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <span className="text-sm text-slate-500">via {job.source}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        View & Apply
                      </button>
                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Original
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bookmark className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No saved jobs</h3>
          <p className="text-slate-500">Jobs you save will appear here for quick access.</p>
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
