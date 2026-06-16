import { useState } from 'react';
import { useStore } from './store/useStore';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { Profile } from './pages/Profile';
import { Applications } from './pages/Applications';
import { SavedJobs } from './pages/SavedJobs';
import { Documents } from './pages/Documents';
import { Drafts } from './pages/Drafts';
import { Settings } from './pages/Settings';
import { Admin } from './pages/Admin';
import { Connectors } from './pages/Connectors';

type Page = 'login' | 'register' | 'dashboard' | 'jobs' | 'profile' | 'applications' | 'saved' | 'documents' | 'drafts' | 'settings' | 'admin' | 'connectors';

const pageConfig: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Welcome to your job command center' },
  jobs: { title: 'Find Jobs', subtitle: 'Discover opportunities from 10+ platforms' },
  profile: { title: 'My Profile', subtitle: 'Manage your professional profile' },
  applications: { title: 'Applications', subtitle: 'Track your job applications' },
  saved: { title: 'Saved Jobs', subtitle: 'Jobs you\'ve bookmarked' },
  documents: { title: 'Documents', subtitle: 'Your generated resumes and cover letters' },
  drafts: { title: 'Email Drafts', subtitle: 'Manage your saved email drafts' },
  connectors: { title: 'API Connectors', subtitle: 'Connect to job platforms and email services' },
  settings: { title: 'Settings', subtitle: 'Manage your account preferences' },
  admin: { title: 'Admin Panel', subtitle: 'Platform administration' },
};

export default function App() {
  const { isAuthenticated, sidebarOpen } = useStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    if (currentPage === 'register') {
      return <Register onNavigate={handleNavigate} />;
    }
    return <Login onNavigate={handleNavigate} />;
  }

  const config = pageConfig[currentPage] || { title: 'JobPilot AI' };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'jobs':
        return <Jobs />;
      case 'profile':
        return <Profile />;
      case 'applications':
        return <Applications />;
      case 'saved':
        return <SavedJobs />;
      case 'documents':
        return <Documents />;
      case 'drafts':
        return <Drafts />;
      case 'connectors':
        return <Connectors />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return <Admin />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header 
          title={config.title} 
          subtitle={config.subtitle}
          onQuickApply={currentPage === 'jobs' ? () => {} : undefined}
        />
        
        <main className="p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
