import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  User, 
  Briefcase, 
  BookmarkCheck,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Plug,
  Mail
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { sidebarOpen, toggleSidebar, isAdmin, logout, currentUser } = useStore();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Find Jobs', icon: Search },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'saved', label: 'Saved Jobs', icon: BookmarkCheck },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'drafts', label: 'Email Drafts', icon: Mail },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'connectors', label: 'API Connectors', icon: Plug },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  
  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: Shield });
  }

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Rocket className="w-6 h-6" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg">JobPilot</h1>
              <p className="text-xs text-slate-400">AI-Powered</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      
      {/* User Info */}
      {sidebarOpen && currentUser && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center font-bold">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25' 
                  : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
      
      {/* Logout */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <button
          onClick={() => {
            logout();
            onNavigate('login');
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all ${
            !sidebarOpen && 'justify-center'
          }`}
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
