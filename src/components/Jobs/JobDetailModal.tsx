import { useState } from 'react';
import { 
  X, Building2, MapPin, DollarSign, Clock, Globe, Briefcase,
  CheckCircle2, AlertCircle, Sparkles, FileText, Send, ExternalLink,
  TrendingUp, Award, Target, Zap, Mail
} from 'lucide-react';
import { Job, MatchAnalysis } from '../../types';
import { useStore } from '../../store/useStore';
import { calculateMatchAnalysis, generateTailoredResume, generateCoverLetter } from '../../utils/aiEngine';
import { formatDistanceToNow } from 'date-fns';
import { EmailComposer } from '../Email/EmailComposer';

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
}

export function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  const { profile, currentUser, applyToJob, saveTailoredResume, saveCoverLetter, applications } = useStore();
  const [activeTab, setActiveTab] = useState<'details' | 'match' | 'apply'>('details');
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(
    applications.some(a => a.jobId === job.id)
  );
  const [generatedDocs, setGeneratedDocs] = useState<{
    resume: string;
    coverLetter: string;
    atsScore: number;
  } | null>(null);
  const [showEmailComposer, setShowEmailComposer] = useState(false);

  // Calculate match analysis
  const matchAnalysis: MatchAnalysis | null = profile && profile.skills.length > 0
    ? calculateMatchAnalysis(job, profile)
    : null;

  const handleApply = async () => {
    if (!currentUser || !profile) return;

    setIsApplying(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate documents
    const resume = generateTailoredResume(job, profile, currentUser);
    const coverLetter = generateCoverLetter(job, profile, currentUser);

    setGeneratedDocs({
      resume: resume.tailoredContent,
      coverLetter: coverLetter.content,
      atsScore: resume.atsScore
    });

    // Save documents
    saveTailoredResume(resume);
    saveCoverLetter(coverLetter);

    // Create application
    applyToJob(job, resume, coverLetter);

    // If external, open in new tab
    if (job.applyType === 'external') {
      window.open(job.applicationUrl, '_blank');
    }

    setApplied(true);
    setIsApplying(false);
    setActiveTab('apply');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{job.title}</h2>
              <p className="text-blue-100 text-lg">{job.company}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-blue-100">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}, {job.country}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span className="capitalize">{job.remote}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Match Score */}
            {matchAnalysis && (
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center ${
                  matchAnalysis.overallScore >= 80 
                    ? 'bg-green-500' 
                    : matchAnalysis.overallScore >= 60 
                      ? 'bg-yellow-500' 
                      : 'bg-white/20'
                }`}>
                  <span className="text-2xl font-bold">{matchAnalysis.overallScore}%</span>
                  <span className="text-xs">Match</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex">
            {(['details', 'match', 'apply'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'match' ? 'Match Analysis' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCard 
                  icon={Briefcase} 
                  label="Job Type" 
                  value={job.type} 
                />
                <InfoCard 
                  icon={DollarSign} 
                  label="Salary" 
                  value={job.salary 
                    ? `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
                    : 'Not specified'
                  } 
                />
                <InfoCard 
                  icon={Clock} 
                  label="Experience" 
                  value={job.experience} 
                />
                <InfoCard 
                  icon={Award} 
                  label="Visa" 
                  value={job.visaSponsorship ? 'Sponsorship Available' : 'Not Available'} 
                />
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-3">Job Description</h3>
                <p className="text-slate-600 leading-relaxed">{job.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Responsibilities */}
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-3">Responsibilities</h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              {job.benefits.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-3">Benefits</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit, i) => (
                      <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        profile?.skills.some(s => s.toLowerCase() === skill.toLowerCase())
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'match' && matchAnalysis && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">Overall Match Score</h3>
                    <p className="text-slate-500">Based on your profile analysis</p>
                  </div>
                  <div className={`text-4xl font-bold ${
                    matchAnalysis.overallScore >= 80 
                      ? 'text-green-600' 
                      : matchAnalysis.overallScore >= 60 
                        ? 'text-yellow-600' 
                        : 'text-slate-600'
                  }`}>
                    {matchAnalysis.overallScore}%
                  </div>
                </div>
              </div>

              {/* Match Breakdown */}
              <div className="grid md:grid-cols-2 gap-4">
                <MatchCard 
                  icon={Zap}
                  title="Skills Match"
                  score={matchAnalysis.skillsMatch.score}
                  details={`${matchAnalysis.skillsMatch.matched.length} skills matched`}
                />
                <MatchCard 
                  icon={TrendingUp}
                  title="Experience Match"
                  score={matchAnalysis.experienceMatch.score}
                  details={`${matchAnalysis.experienceMatch.candidate} vs ${matchAnalysis.experienceMatch.required} required`}
                />
                <MatchCard 
                  icon={Target}
                  title="Title Match"
                  score={matchAnalysis.titleMatch.score}
                  details={`${matchAnalysis.titleMatch.similarity}% similarity`}
                />
                <MatchCard 
                  icon={MapPin}
                  title="Location Match"
                  score={matchAnalysis.locationMatch.score}
                  details={matchAnalysis.locationMatch.compatible ? 'Compatible' : 'May require relocation'}
                />
              </div>

              {/* Missing Skills */}
              {matchAnalysis.skillsMatch.missing.length > 0 && (
                <div className="bg-yellow-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">Missing Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchAnalysis.skillsMatch.missing.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ATS Suggestions */}
              <div className="bg-blue-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">ATS Optimization Tips</h3>
                </div>
                <ul className="space-y-2">
                  {matchAnalysis.atsAnalysis.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-blue-700 text-sm">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Certifications */}
              {matchAnalysis.certificationsMatch.recommended.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Recommended Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {matchAnalysis.certificationsMatch.recommended.map((cert) => (
                      <span key={cert} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm border border-purple-200">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'apply' && (
            <div className="space-y-6">
              {applied ? (
                <>
                  {/* Success State */}
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {job.applyType === 'direct' ? 'Application Submitted!' : 'Documents Generated!'}
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      {job.applyType === 'direct' 
                        ? 'Your tailored resume and cover letter have been submitted to the employer.'
                        : 'Your documents are ready. Complete your application on the company website.'}
                    </p>
                  </div>

                  {/* Generated Documents Preview */}
                  {generatedDocs && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium text-slate-900">Tailored Resume</h4>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            ATS: {generatedDocs.atsScore}%
                          </span>
                        </div>
                        <pre className="text-xs text-slate-600 bg-white p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap">
                          {generatedDocs.resume.substring(0, 500)}...
                        </pre>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <h4 className="font-medium text-slate-900">Cover Letter</h4>
                        </div>
                        <pre className="text-xs text-slate-600 bg-white p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap">
                          {generatedDocs.coverLetter.substring(0, 500)}...
                        </pre>
                      </div>
                    </div>
                  )}

                  {job.applyType === 'external' && (
                    <div className="flex flex-col items-center gap-3">
                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Complete Application on {job.company}
                      </a>
                      <button
                        onClick={() => setShowEmailComposer(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 border border-purple-300 text-purple-700 rounded-xl font-medium hover:bg-purple-50 transition-all"
                      >
                        <Mail className="w-5 h-5" />
                        Email Application
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Apply Form */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">AI-Powered Application</h3>
                        <p className="text-slate-600 mt-1">
                          JobPilot AI will automatically generate a tailored resume and cover letter 
                          optimized for this specific position and ATS systems.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>AI-tailored resume with job-specific keywords</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Personalized cover letter for {job.company}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>ATS optimization score analysis</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Application tracking in your dashboard</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleApply}
                      disabled={isApplying || !profile?.skills.length}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApplying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Generating Documents...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          {job.applyType === 'direct' ? 'Apply Now' : 'Generate & Apply'}
                        </>
                      )}
                    </button>

                    {!profile?.skills.length && (
                      <p className="text-center text-sm text-red-500 mt-2">
                        Please complete your profile with skills before applying
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email Composer Modal */}
      {showEmailComposer && generatedDocs && (
        <EmailComposer
          job={job}
          coverLetter={generatedDocs.coverLetter}
          resumeContent={generatedDocs.resume}
          onClose={() => setShowEmailComposer(false)}
          onSent={() => setShowEmailComposer(false)}
        />
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <Icon className="w-5 h-5 text-slate-400 mb-2" />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-medium text-slate-900 capitalize">{value}</p>
    </div>
  );
}

function MatchCard({ icon: Icon, title, score, details }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  score: number;
  details: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{title}</p>
            <p className="text-sm text-slate-500">{details}</p>
          </div>
        </div>
        <div className={`text-2xl font-bold ${
          score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-slate-600'
        }`}>
          {score}%
        </div>
      </div>
      <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${
            score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-slate-400'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
