import { Bell, Search, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onQuickApply?: () => void;
}

export function Header({ title, subtitle, onQuickApply }: HeaderProps) {
  const { applications } = useStore();
  
  const pendingApplications = applications.filter(a => 
    a.status === 'pending' || a.status === 'under_review'
  ).length;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Quick search..."
              className="pl-10 pr-4 py-2 w-64 bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
          
          {/* Quick Apply Button */}
          {onQuickApply && (
            <button
              onClick={onQuickApply}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Quick Apply</span>
            </button>
          )}
          
          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Bell className="w-6 h-6 text-slate-600" />
            {pendingApplications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingApplications}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
