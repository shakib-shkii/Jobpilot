import { useState } from 'react';
import { 
  Settings as SettingsIcon, Bell, Shield, Globe, Moon, Sun,
  Mail, Smartphone, Lock, Eye, Save, Check
} from 'lucide-react';

export function Settings() {
  const [activeSection, setActiveSection] = useState('notifications');
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    weeklyDigest: false,
    marketingEmails: false,
    
    // Privacy
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessaging: true,
    
    // Preferences
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    
    // Security
    twoFactorEnabled: false,
    sessionTimeout: '30',
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-6">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Settings</h2>
              <p className="text-sm text-slate-500">Manage your preferences</p>
            </div>
          </div>

          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Notifications */}
        {activeSection === 'notifications' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Notification Settings</h2>
            
            <div className="space-y-6">
              <ToggleSetting
                icon={Mail}
                label="Email Notifications"
                description="Receive notifications via email"
                checked={settings.emailNotifications}
                onChange={(v) => updateSetting('emailNotifications', v)}
              />
              <ToggleSetting
                icon={Bell}
                label="Job Alerts"
                description="Get notified about new job matches"
                checked={settings.jobAlerts}
                onChange={(v) => updateSetting('jobAlerts', v)}
              />
              <ToggleSetting
                icon={Smartphone}
                label="Application Updates"
                description="Receive updates about your applications"
                checked={settings.applicationUpdates}
                onChange={(v) => updateSetting('applicationUpdates', v)}
              />
              <ToggleSetting
                icon={Mail}
                label="Weekly Digest"
                description="Get a weekly summary of job opportunities"
                checked={settings.weeklyDigest}
                onChange={(v) => updateSetting('weeklyDigest', v)}
              />
              <ToggleSetting
                icon={Mail}
                label="Marketing Emails"
                description="Receive promotional content and updates"
                checked={settings.marketingEmails}
                onChange={(v) => updateSetting('marketingEmails', v)}
              />
            </div>
          </div>
        )}

        {/* Privacy */}
        {activeSection === 'privacy' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Privacy Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Profile Visibility</label>
                <select
                  value={settings.profileVisibility}
                  onChange={(e) => updateSetting('profileVisibility', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                >
                  <option value="public">Public - Visible to recruiters</option>
                  <option value="private">Private - Only you can see</option>
                  <option value="connections">Connections Only</option>
                </select>
              </div>

              <ToggleSetting
                icon={Eye}
                label="Show Email Address"
                description="Allow others to see your email address"
                checked={settings.showEmail}
                onChange={(v) => updateSetting('showEmail', v)}
              />
              <ToggleSetting
                icon={Smartphone}
                label="Show Phone Number"
                description="Allow others to see your phone number"
                checked={settings.showPhone}
                onChange={(v) => updateSetting('showPhone', v)}
              />
              <ToggleSetting
                icon={Mail}
                label="Allow Messaging"
                description="Allow recruiters to send you messages"
                checked={settings.allowMessaging}
                onChange={(v) => updateSetting('allowMessaging', v)}
              />
            </div>
          </div>
        )}

        {/* Preferences */}
        {activeSection === 'preferences' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
                <div className="flex gap-3">
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                  ].map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <button
                        key={theme.value}
                        onClick={() => updateSetting('theme', theme.value)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                          settings.theme === theme.value
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {theme.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية (Arabic)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting('timezone', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                >
                  <option value="UTC">UTC</option>
                  <option value="Asia/Dubai">Dubai (GMT+4)</option>
                  <option value="Asia/Riyadh">Riyadh (GMT+3)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="America/New_York">New York (EST)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeSection === 'security' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Security Settings</h2>
            
            <div className="space-y-6">
              <ToggleSetting
                icon={Shield}
                label="Two-Factor Authentication"
                description="Add an extra layer of security to your account"
                checked={settings.twoFactorEnabled}
                onChange={(v) => updateSetting('twoFactorEnabled', v)}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout</label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="font-medium text-slate-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    />
                  </div>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="px-6 py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToggleSettingProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleSetting({ icon: Icon, label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <p className="font-medium text-slate-900">{label}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-all ${
          checked ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span 
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
            checked ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}
