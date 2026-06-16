import { useState } from 'react';
import { 
  Briefcase, Building2, MapPin, Clock, FileText, Eye,
  ChevronDown, Filter, Calendar, TrendingUp, CheckCircle2, XCircle,
  AlertCircle, Send, MessageSquare
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Application } from '../types';
import { formatDistanceToNow, format } from 'date-fns';

export function Applications() {
  const { applications, updateApplicationStatus } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const statusOptions = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'redirected', label: 'Redirected' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' || app.status === filterStatus
  );

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending' || a.status === 'submitted').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
      pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
      submitted: { color: 'text-blue-600', bg: 'bg-blue-50', icon: Send },
      redirected: { color: 'text-purple-600', bg: 'bg-purple-50', icon: Send },
      under_review: { color: 'text-cyan-600', bg: 'bg-cyan-50', icon: Eye },
      interview: { color: 'text-green-600', bg: 'bg-green-50', icon: Calendar },
      offer: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
      rejected: { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
      withdrawn: { color: 'text-slate-600', bg: 'bg-slate-50', icon: AlertCircle },
    };
    return configs[status] || configs.pending;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Applications" value={stats.total} color="blue" />
        <StatCard label="Pending/Submitted" value={stats.pending} color="yellow" />
        <StatCard label="Interviews" value={stats.interview} color="green" />
        <StatCard label="Offers" value={stats.offer} color="emerald" />
        <StatCard label="Rejected" value={stats.rejected} color="red" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <span className="font-medium text-slate-700">Filter by Status:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterStatus(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((app) => {
            const statusConfig = getStatusConfig(app.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div 
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedApp(app)}
              >
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-7 h-7 text-slate-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">{app.job.title}</h3>
                        <p className="text-slate-600">{app.job.company}</p>
                      </div>

                      {/* Status Badge */}
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="capitalize">{app.status.replace('_', ' ')}</span>
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {app.job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Applied {formatDistanceToNow(new Date(app.appliedDate), { addSuffix: true })}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Match: {app.matchScore}%
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        ATS: {app.atsScore}%
                      </span>
                    </div>

                    {/* Timeline Preview */}
                    {app.timeline.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Latest:</span>{' '}
                          {app.timeline[app.timeline.length - 1].description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No applications found</h3>
            <p className="text-slate-500">
              {filterStatus === 'all' 
                ? 'Start applying to jobs to track your applications here.' 
                : 'No applications with this status.'}
            </p>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdateStatus={updateApplicationStatus}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    green: 'bg-green-500/10 text-green-600 border-green-200',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    red: 'bg-red-500/10 text-red-600 border-red-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
  onUpdateStatus: (id: string, status: Application['status']) => void;
}

function ApplicationDetailModal({ application, onClose, onUpdateStatus }: ApplicationDetailModalProps) {
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);

  const statuses: Application['status'][] = [
    'pending', 'submitted', 'redirected', 'under_review', 'interview', 'offer', 'rejected', 'withdrawn'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold">{application.job.title}</h2>
          <p className="text-blue-100">{application.job.company}</p>
          
          <div className="flex items-center gap-4 mt-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm capitalize">
              {application.status.replace('_', ' ')}
            </span>
            <span className="text-sm text-blue-100">
              Applied {format(new Date(application.appliedDate), 'PPP')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Scores */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{application.matchScore}%</p>
              <p className="text-sm text-blue-600">Match Score</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{application.atsScore}%</p>
              <p className="text-sm text-green-600">ATS Score</p>
            </div>
          </div>

          {/* Update Status */}
          <div className="mb-6">
            <button
              onClick={() => setShowStatusUpdate(!showStatusUpdate)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors w-full justify-between"
            >
              <span className="font-medium text-slate-700">Update Status</span>
              <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${showStatusUpdate ? 'rotate-180' : ''}`} />
            </button>
            
            {showStatusUpdate && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      onUpdateStatus(application.id, status);
                      setShowStatusUpdate(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      application.status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Application Timeline</h3>
            <div className="space-y-4">
              {application.timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                    {index < application.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm text-slate-500">
                      {format(new Date(event.date), 'PPP p')}
                    </p>
                    <p className="font-medium text-slate-900">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {application.notes && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Notes
              </h3>
              <p className="text-slate-600 whitespace-pre-wrap">{application.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
