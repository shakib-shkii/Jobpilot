import { useState } from 'react';
import { 
  FileText, Download, Eye, Clock, Briefcase,
  TrendingUp, CheckCircle2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export function Documents() {
  const { tailoredResumes, coverLetters, jobs } = useStore();
  const [activeTab, setActiveTab] = useState<'resumes' | 'coverletters'>('resumes');
  const [selectedDoc, setSelectedDoc] = useState<{ type: string; content: string; title: string } | null>(null);

  const getJobById = (jobId: string) => jobs.find(j => j.id === jobId);

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Generated Documents</h2>
            <p className="text-slate-500">
              {tailoredResumes.length} resumes • {coverLetters.length} cover letters
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('resumes')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'resumes'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Tailored Resumes ({tailoredResumes.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('coverletters')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'coverletters'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Cover Letters ({coverLetters.length})
          </span>
        </button>
      </div>

      {/* Documents List */}
      {activeTab === 'resumes' && (
        <div className="space-y-4">
          {tailoredResumes.length > 0 ? (
            tailoredResumes.map((resume) => {
              const job = getJobById(resume.jobId);
              return (
                <div 
                  key={resume.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Resume for {job?.title || 'Unknown Position'}
                        </h3>
                        <p className="text-slate-500">{job?.company || 'Unknown Company'}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(resume.createdAt), 'PPP')}
                          </span>
                          <span className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            ATS Score: {resume.atsScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDoc({
                          type: 'Resume',
                          content: resume.tailoredContent,
                          title: `Resume - ${job?.title}`
                        })}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(
                          resume.tailoredContent,
                          `Resume_${job?.company?.replace(/\s+/g, '_')}_${job?.title?.replace(/\s+/g, '_')}.txt`
                        )}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Optimizations */}
                  {resume.optimizations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm font-medium text-slate-700 mb-2">Optimizations Applied:</p>
                      <div className="flex flex-wrap gap-2">
                        {resume.optimizations.slice(0, 3).map((opt, i) => (
                          <span key={i} className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-lg">
                            <CheckCircle2 className="w-3 h-3" />
                            {opt.slice(0, 50)}...
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  {resume.keywords.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-slate-700 mb-2">Matched Keywords:</p>
                      <div className="flex flex-wrap gap-2">
                        {resume.keywords.slice(0, 8).map((keyword) => (
                          <span key={keyword} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <EmptyState 
              icon={FileText}
              title="No tailored resumes yet"
              description="When you apply to jobs, AI-tailored resumes will appear here."
            />
          )}
        </div>
      )}

      {activeTab === 'coverletters' && (
        <div className="space-y-4">
          {coverLetters.length > 0 ? (
            coverLetters.map((letter) => {
              const job = getJobById(letter.jobId);
              return (
                <div 
                  key={letter.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Cover Letter for {job?.title || 'Unknown Position'}
                        </h3>
                        <p className="text-slate-500">{job?.company || 'Unknown Company'}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(letter.createdAt), 'PPP')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job?.remote || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDoc({
                          type: 'Cover Letter',
                          content: letter.content,
                          title: `Cover Letter - ${job?.title}`
                        })}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(
                          letter.content,
                          `CoverLetter_${job?.company?.replace(/\s+/g, '_')}_${job?.title?.replace(/\s+/g, '_')}.txt`
                        )}
                        className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {letter.content.slice(0, 300)}...
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState 
              icon={FileText}
              title="No cover letters yet"
              description="When you apply to jobs, AI-generated cover letters will appear here."
            />
          )}
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDoc(null)} />
          
          <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <h3 className="font-semibold">{selectedDoc.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 bg-slate-50 p-6 rounded-xl">
                {selectedDoc.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
      <Icon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
      <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500">{description}</p>
    </div>
  );
}
