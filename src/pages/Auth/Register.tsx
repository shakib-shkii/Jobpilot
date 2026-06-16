import { useState } from 'react';
import { 
  Rocket, Mail, Lock, User, Phone, MapPin, Globe, 
  Briefcase, DollarSign, Clock, Plane, ArrowRight, ArrowLeft, Check, Link2
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface RegisterProps {
  onNavigate: (page: string) => void;
}

const countries = [
  'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'Netherlands', 'Singapore', 'India', 'Pakistan', 'Egypt', 'Jordan'
];

const jobTitles = [
  'Network Engineer', 'NOC Engineer', 'IT Support Engineer', 'System Administrator',
  'Infrastructure Engineer', 'Cybersecurity Engineer', 'Cloud Engineer', 'SOC Analyst',
  'DevOps Engineer', 'Security Engineer', 'Solutions Architect', 'Technical Lead'
];

const visaStatuses = [
  'Citizen', 'Permanent Resident', 'Work Visa', 'Student Visa', 
  'Requires Sponsorship', 'Open to Relocate'
];

const noticePeriods = [
  'Immediate', '1 Week', '2 Weeks', '1 Month', '2 Months', '3 Months'
];

export function Register({ onNavigate }: RegisterProps) {
  const { register } = useStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    preferredJobTitles: [] as string[],
    preferredCountries: [] as string[],
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    noticePeriod: '',
    visaStatus: ''
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'preferredJobTitles' | 'preferredCountries', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      linkedinUrl: formData.linkedinUrl,
      portfolioUrl: formData.portfolioUrl,
      githubUrl: formData.githubUrl,
      preferredJobTitles: formData.preferredJobTitles,
      preferredCountries: formData.preferredCountries,
      salaryExpectations: {
        min: parseInt(formData.salaryMin) || 0,
        max: parseInt(formData.salaryMax) || 0,
        currency: formData.currency
      },
      noticePeriod: formData.noticePeriod,
      visaStatus: formData.visaStatus
    });
    
    onNavigate('dashboard');
    setLoading(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.password && 
               formData.password === formData.confirmPassword;
      case 2:
        return true; // Optional fields
      case 3:
        return formData.preferredJobTitles.length > 0;
      case 4:
        return formData.preferredCountries.length > 0;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-white mb-6">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-white mb-6">Contact & Links</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="Dubai, UAE"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn URL</label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => updateField('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Portfolio URL</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => updateField('portfolioUrl', e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">GitHub URL</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => updateField('githubUrl', e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-white mb-2">Preferred Job Titles</h3>
            <p className="text-slate-400 text-sm mb-6">Select the roles you're interested in</p>
            
            <div className="grid grid-cols-2 gap-3">
              {jobTitles.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => toggleArrayField('preferredJobTitles', title)}
                  className={`px-4 py-3 rounded-xl border text-left transition-all ${
                    formData.preferredJobTitles.includes(title)
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm">{title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-white mb-2">Preferred Countries</h3>
            <p className="text-slate-400 text-sm mb-6">Where would you like to work?</p>
            
            <div className="grid grid-cols-3 gap-3">
              {countries.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => toggleArrayField('preferredCountries', country)}
                  className={`px-4 py-3 rounded-xl border text-center transition-all ${
                    formData.preferredCountries.includes(country)
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className="text-sm">{country}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-white mb-6">Preferences</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Salary Expectations</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => updateField('salaryMin', e.target.value)}
                    placeholder="Min"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => updateField('salaryMax', e.target.value)}
                    placeholder="Max"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <select
                  value={formData.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AED">AED</option>
                  <option value="SAR">SAR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Notice Period</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={formData.noticePeriod}
                  onChange={(e) => updateField('noticePeriod', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none appearance-none"
                >
                  <option value="">Select notice period</option>
                  {noticePeriods.map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Visa Status</label>
              <div className="relative">
                <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={formData.visaStatus}
                  onChange={(e) => updateField('visaStatus', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none appearance-none"
                >
                  <option value="">Select visa status</option>
                  {visaStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">JobPilot AI</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                  s < step 
                    ? 'bg-green-500 text-white' 
                    : s === step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white/10 text-slate-400'
                }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 5 && (
                <div className={`w-12 h-1 mx-1 rounded ${s < step ? 'bg-green-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => step === 1 ? onNavigate('login') : setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {step === 1 ? 'Back to Login' : 'Previous'}
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
