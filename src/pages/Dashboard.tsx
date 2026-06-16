import { 
  Search, Briefcase, TrendingUp, Calendar, Award, Bookmark,
  ArrowUpRight, MapPin, Building2, Clock, Sparkles
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { currentUser, applications, savedJobs, jobs, profile } = useStore();
  
  // Calculate stats
  const stats = {
    jobsFound: jobs.length,
    applicationsSent: applications.length,
    averageMatchScore: applications.length > 0 
      ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length)
      : 0,
    interviewRate: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => a.status === 'offer').length,
    savedJobs: savedJobs.length,
  };
  
  // Get recommended jobs (top 5 by match score)
  const recommendedJobs = [...jobs]
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 5);
  
  // Recent applications
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      submitted: 'bg-blue-500/10 text-blue-500',
      redirected: 'bg-purple-500/10 text-purple-500',
      under_review: 'bg-cyan-500/10 text-cyan-500',
      interview: 'bg-green-500/10 text-green-500',
      offer: 'bg-emerald-500/10 text-emerald-500',
      rejected: 'bg-red-500/10 text-red-500',
      withdrawn: 'bg-slate-500/10 text-slate-500',
    };
    return colors[status] || 'bg-slate-500/10 text-slate-500';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {currentUser?.name.split(' ')[0]}! 👋
            </h2>
            <p className="text-blue-100 mb-4">
              {profile?.skills.length ? (
                `Your profile is ${Math.min(100, profile.skills.length * 10 + profile.experience.length * 20)}% complete. ${
                  profile.skills.length < 5 ? 'Add more skills to improve matches.' : 'Great job!'
                }`
              ) : (
                'Complete your profile to get personalized job matches.'
              )}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => onNavigate('jobs')}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Find Jobs
              </button>
              <button 
                onClick={() => onNavigate('profile')}
                className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard 
          icon={Search} 
          label="Jobs Found" 
          value={stats.jobsFound} 
          color="blue" 
          onClick={() => onNavigate('jobs')}
        />
        <StatCard 
          icon={Briefcase} 
          label="Applications" 
          value={stats.applicationsSent} 
          color="purple" 
          onClick={() => onNavigate('applications')}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Avg Match" 
          value={`${stats.averageMatchScore}%`} 
          color="green" 
        />
        <StatCard 
          icon={Calendar} 
          label="Interviews" 
          value={stats.interviewRate} 
          color="cyan" 
        />
        <StatCard 
          icon={Award} 
          label="Offers" 
          value={stats.offers} 
          color="emerald" 
        />
        <StatCard 
          icon={Bookmark} 
          label="Saved Jobs" 
          value={stats.savedJobs} 
          color="orange" 
          onClick={() => onNavigate('saved')}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-lg text-slate-900">Recent Applications</h3>
            <button 
              onClick={() => onNavigate('applications')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <div key={app.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 truncate">{app.job.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {app.job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(app.appliedDate), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-slate-500">Match:</span>
                      <span className="font-medium text-blue-600">{app.matchScore}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-slate-500">ATS:</span>
                      <span className="font-medium text-green-600">{app.atsScore}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No applications yet</p>
                <button 
                  onClick={() => onNavigate('jobs')}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Start applying →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-lg text-slate-900">Recommended for You</h3>
            <button 
              onClick={() => onNavigate('jobs')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {recommendedJobs.map((job) => (
              <div 
                key={job.id} 
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onNavigate('jobs')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900 truncate">{job.title}</h4>
                      {job.matchScore && job.matchScore >= 80 && (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs font-medium rounded-full">
                          Great Match
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                    </div>
                  </div>
                  {job.matchScore && (
                    <div className="flex items-center gap-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        job.matchScore >= 80 
                          ? 'bg-green-500/10 text-green-600' 
                          : job.matchScore >= 60 
                            ? 'bg-yellow-500/10 text-yellow-600'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {job.matchScore}%
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills.slice(0, 4).map((skill) => (
                    <span 
                      key={skill} 
                      className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md">
                      +{job.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-lg text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard 
            icon={Search}
            label="Search Jobs"
            description="Find your perfect role"
            onClick={() => onNavigate('jobs')}
          />
          <QuickActionCard 
            icon={Briefcase}
            label="Upload CV"
            description="Update your resume"
            onClick={() => onNavigate('profile')}
          />
          <QuickActionCard 
            icon={TrendingUp}
            label="Track Applications"
            description="Monitor your progress"
            onClick={() => onNavigate('applications')}
          />
          <QuickActionCard 
            icon={Sparkles}
            label="AI Resume Builder"
            description="Optimize for ATS"
            onClick={() => onNavigate('documents')}
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  onClick?: () => void;
}

function StatCard({ icon: Icon, label, value, color, onClick }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
    green: 'bg-green-500/10 text-green-600',
    cyan: 'bg-cyan-500/10 text-cyan-600',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    orange: 'bg-orange-500/10 text-orange-600',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-4 ${onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''} transition-all`}
    >
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

interface QuickActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  onClick: () => void;
}

function QuickActionCard({ icon: Icon, label, description, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all group"
    >
      <Icon className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors mb-3" />
      <p className="font-medium text-slate-900">{label}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </button>
  );
}
