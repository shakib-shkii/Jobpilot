import { useState } from 'react';
import { 
  Users, Briefcase, BarChart3, Activity, 
  TrendingUp, Search, Filter, MoreVertical, Eye,
  Globe, Shield, Database, Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';

export function Admin() {
  const { jobs, applications } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'jobs' | 'analytics'>('overview');

  // Mock admin data
  const adminStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalJobs: jobs.length,
    totalApplications: applications.length * 156, // Mock multiplier
    apiCalls: 45892,
    successRate: 98.5,
  };

  const jobSources = [
    { name: 'LinkedIn', jobs: 4521, active: true },
    { name: 'Indeed', jobs: 3892, active: true },
    { name: 'Jooble', jobs: 2341, active: true },
    { name: 'Adzuna', jobs: 1892, active: true },
    { name: 'RemoteOK', jobs: 892, active: true },
    { name: 'Jobicy', jobs: 456, active: true },
    { name: 'Greenhouse', jobs: 2100, active: true },
    { name: 'Lever', jobs: 1560, active: true },
    { name: 'Workday', jobs: 3200, active: true },
    { name: 'Direct', jobs: 780, active: false },
  ];

  const recentActivity = [
    { action: 'New user registered', user: 'Ahmed Hassan', time: '2 min ago' },
    { action: 'Job applied', user: 'Sarah Johnson', time: '5 min ago' },
    { action: 'Resume generated', user: 'Mohammed Ali', time: '8 min ago' },
    { action: 'Profile updated', user: 'John Smith', time: '12 min ago' },
    { action: 'New user registered', user: 'Maria Garcia', time: '15 min ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <p className="text-slate-400">Manage your JobPilot AI platform</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'jobs', label: 'Job Sources', icon: Briefcase },
          { id: 'analytics', label: 'Analytics', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={Users} label="Total Users" value={adminStats.totalUsers.toLocaleString()} color="blue" />
            <StatCard icon={Users} label="Active Users" value={adminStats.activeUsers.toLocaleString()} color="green" />
            <StatCard icon={Briefcase} label="Total Jobs" value={adminStats.totalJobs.toLocaleString()} color="purple" />
            <StatCard icon={TrendingUp} label="Applications" value={adminStats.totalApplications.toLocaleString()} color="cyan" />
            <StatCard icon={Zap} label="API Calls" value={adminStats.apiCalls.toLocaleString()} color="orange" />
            <StatCard icon={Activity} label="Success Rate" value={`${adminStats.successRate}%`} color="emerald" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-lg text-slate-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{activity.action}</p>
                        <p className="text-sm text-slate-500">{activity.user}</p>
                      </div>
                      <span className="text-sm text-slate-400">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Sources Status */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-lg text-slate-900">Job Sources</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {jobSources.map((source) => (
                  <div key={source.name} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${source.active ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="font-medium text-slate-900">{source.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500">{source.jobs.toLocaleString()} jobs</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        source.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {source.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-lg text-slate-900">User Management</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                <Filter className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">User</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Email</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Applications</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Ahmed Hassan', email: 'ahmed@example.com', apps: 24, status: 'Active' },
                  { name: 'Sarah Johnson', email: 'sarah@example.com', apps: 18, status: 'Active' },
                  { name: 'Mohammed Ali', email: 'mohammed@example.com', apps: 32, status: 'Active' },
                  { name: 'John Smith', email: 'john@example.com', apps: 12, status: 'Inactive' },
                  { name: 'Maria Garcia', email: 'maria@example.com', apps: 45, status: 'Active' },
                ].map((user) => (
                  <tr key={user.email} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4 text-slate-500">{user.apps}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-slate-100 rounded">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-1 hover:bg-slate-100 rounded">
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobSources.map((source) => (
              <div 
                key={source.name}
                className="bg-white rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-slate-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900">{source.name}</h4>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${source.active ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Jobs Indexed</span>
                    <span className="font-medium text-slate-900">{source.jobs.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className={source.active ? 'text-green-600' : 'text-red-600'}>
                      {source.active ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Last Sync</span>
                    <span className="text-slate-600">2 min ago</span>
                  </div>
                </div>

                <button className={`w-full mt-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  source.active 
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  {source.active ? 'Configure' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg text-slate-900 mb-4">Application Trends</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {[65, 45, 78, 52, 89, 67, 94, 72, 85, 91, 78, 88].map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-xs text-slate-500">
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg text-slate-900 mb-4">Top Job Categories</h3>
              <div className="space-y-4">
                {[
                  { name: 'Network Engineering', value: 32, color: 'blue' },
                  { name: 'Cybersecurity', value: 28, color: 'purple' },
                  { name: 'Cloud Engineering', value: 22, color: 'cyan' },
                  { name: 'System Administration', value: 18, color: 'green' },
                ].map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">{cat.name}</span>
                      <span className="text-sm font-medium text-slate-900">{cat.value}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-${cat.color}-500`}
                        style={{ 
                          width: `${cat.value}%`,
                          background: cat.color === 'blue' ? '#3b82f6' : 
                                     cat.color === 'purple' ? '#8b5cf6' :
                                     cat.color === 'cyan' ? '#06b6d4' : '#22c55e'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-lg text-slate-900 mb-4">System Health</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'API Response Time', value: '45ms', status: 'good' },
                { label: 'Database Health', value: '99.9%', status: 'good' },
                { label: 'Queue Status', value: '12 jobs', status: 'good' },
                { label: 'Error Rate', value: '0.02%', status: 'good' },
              ].map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                    <Database className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                  <p className="text-sm text-slate-500">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600',
    green: 'bg-green-500/10 text-green-600',
    purple: 'bg-purple-500/10 text-purple-600',
    cyan: 'bg-cyan-500/10 text-cyan-600',
    orange: 'bg-orange-500/10 text-orange-600',
    emerald: 'bg-emerald-500/10 text-emerald-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
