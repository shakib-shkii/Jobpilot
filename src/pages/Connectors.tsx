import { useState, useEffect } from 'react';
import {
  Plug, ExternalLink, RefreshCw,
  Zap, Mail, Globe, Shield, AlertCircle, CheckCircle2,
  Key, Eye, EyeOff, Link2, Unlink
} from 'lucide-react';
import { 
  getAPIConfig, saveAPIConfig, APIConfig,
  searchJSearch, searchAdzuna 
} from '../services/jobApis';
import {
  getEmailConfig, saveEmailConfig, EmailConfig,
  getGmailAuthUrl
} from '../services/emailService';



export function Connectors() {
  const [apiConfig, setApiConfig] = useState<APIConfig>(getAPIConfig());
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(getEmailConfig());
  const [activeTab, setActiveTab] = useState<'jobs' | 'email'>('jobs');
  const [testingApi, setTestingApi] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Save configs when they change
  useEffect(() => {
    saveAPIConfig(apiConfig);
  }, [apiConfig]);

  useEffect(() => {
    saveEmailConfig(emailConfig);
  }, [emailConfig]);

  const updateApiConfig = (platform: keyof APIConfig, field: string, value: any) => {
    setApiConfig(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const updateEmailConfig = (platform: keyof EmailConfig, field: string, value: any) => {
    setEmailConfig(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const testJSearchAPI = async () => {
    setTestingApi('jsearch');
    try {
      const results = await searchJSearch('software engineer', 'New York');
      if (results.length > 0) {
        setTestResults(prev => ({
          ...prev,
          jsearch: { success: true, message: `Connected! Found ${results.length} jobs.` }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          jsearch: { success: false, message: 'API connected but no results returned. Check your quota.' }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        jsearch: { success: false, message: `Error: ${error}` }
      }));
    }
    setTestingApi(null);
  };

  const testAdzunaAPI = async () => {
    setTestingApi('adzuna');
    try {
      const results = await searchAdzuna('developer', 'us');
      if (results.length > 0) {
        setTestResults(prev => ({
          ...prev,
          adzuna: { success: true, message: `Connected! Found ${results.length} jobs.` }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          adzuna: { success: false, message: 'API connected but no results returned.' }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        adzuna: { success: false, message: `Error: ${error}` }
      }));
    }
    setTestingApi(null);
  };

  const connectGmail = () => {
    if (!emailConfig.gmail.clientId) {
      alert('Please enter your Gmail Client ID first');
      return;
    }
    
    const redirectUri = window.location.origin + '/auth/gmail/callback';
    const authUrl = getGmailAuthUrl(emailConfig.gmail.clientId, redirectUri);
    
    // Open in popup
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      authUrl,
      'Gmail Authorization',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const disconnectGmail = () => {
    updateEmailConfig('gmail', 'connected', false);
    updateEmailConfig('gmail', 'accessToken', '');
    updateEmailConfig('gmail', 'refreshToken', '');
    updateEmailConfig('gmail', 'email', '');
  };

  const jobConnectors = [
    {
      id: 'jsearch',
      name: 'JSearch (RapidAPI)',
      description: 'Aggregates jobs from LinkedIn, Indeed, Glassdoor, ZipRecruiter & more',
      icon: '🔍',
      docUrl: 'https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch',
      free: '200 requests/month free',
      fields: [
        { key: 'apiKey', label: 'RapidAPI Key', type: 'password', placeholder: 'Enter your RapidAPI key' },
      ],
    },
    {
      id: 'adzuna',
      name: 'Adzuna',
      description: 'Job aggregator with salary data across 16 countries',
      icon: '💼',
      docUrl: 'https://developer.adzuna.com/',
      free: 'Free tier available',
      fields: [
        { key: 'appId', label: 'App ID', type: 'text', placeholder: 'Your Adzuna App ID' },
        { key: 'appKey', label: 'App Key', type: 'password', placeholder: 'Your Adzuna App Key' },
      ],
    },
    {
      id: 'remoteok',
      name: 'RemoteOK',
      description: 'Remote job listings - No API key required',
      icon: '🌍',
      docUrl: 'https://remoteok.com/api',
      free: 'Completely free',
      fields: [],
    },
    {
      id: 'usajobs',
      name: 'USA Jobs',
      description: 'Official US Government job listings',
      icon: '🇺🇸',
      docUrl: 'https://developer.usajobs.gov/',
      free: 'Free with registration',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your USAJobs API key' },
        { key: 'userAgent', label: 'User Agent (email)', type: 'email', placeholder: 'your@email.com' },
      ],
    },
    {
      id: 'themuse',
      name: 'The Muse',
      description: 'Tech & startup focused job listings',
      icon: '✨',
      docUrl: 'https://www.themuse.com/developers/api/v2',
      free: 'Free API available',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Muse API key' },
      ],
    },
  ];

  const emailConnectors = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Send applications and manage drafts via Gmail',
      icon: '📧',
      docUrl: 'https://console.cloud.google.com/apis/credentials',
      instructions: 'Create OAuth 2.0 credentials in Google Cloud Console',
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      description: 'Coming soon - Send via Outlook/Office 365',
      icon: '📬',
      docUrl: '#',
      disabled: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
            <Plug className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">API Connectors</h1>
            <p className="text-purple-100">Connect to job platforms and email services for real-time data</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'jobs'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-5 h-5" />
          Job Search APIs
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'email'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Mail className="w-5 h-5" />
          Email Services
        </button>
      </div>

      {/* Job APIs */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {jobConnectors.map((connector) => {
            const config = apiConfig[connector.id as keyof APIConfig] as any;
            const isEnabled = config?.enabled;
            const testResult = testResults[connector.id];

            return (
              <div 
                key={connector.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
                        {connector.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-slate-900">{connector.name}</h3>
                          {isEnabled && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Enabled
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-sm mt-1">{connector.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            {connector.free}
                          </span>
                          <a
                            href={connector.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Documentation <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => updateApiConfig(connector.id as keyof APIConfig, 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* API Fields */}
                  {isEnabled && connector.fields.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                      {connector.fields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            {field.label}
                          </label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type={showSecrets[`${connector.id}-${field.key}`] ? 'text' : field.type}
                              value={config?.[field.key] || ''}
                              onChange={(e) => updateApiConfig(connector.id as keyof APIConfig, field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                            />
                            {field.type === 'password' && (
                              <button
                                type="button"
                                onClick={() => toggleSecret(`${connector.id}-${field.key}`)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showSecrets[`${connector.id}-${field.key}`] ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Test Connection Button */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            if (connector.id === 'jsearch') testJSearchAPI();
                            if (connector.id === 'adzuna') testAdzunaAPI();
                          }}
                          disabled={testingApi === connector.id}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {testingApi === connector.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                          Test Connection
                        </button>

                        {testResult && (
                          <span className={`text-sm flex items-center gap-1 ${
                            testResult.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {testResult.success ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                            {testResult.message}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Email Services */}
      {activeTab === 'email' && (
        <div className="space-y-4">
          {emailConnectors.map((connector) => {
            const config = emailConfig[connector.id as keyof EmailConfig] as any;
            const isConnected = config?.connected;

            return (
              <div 
                key={connector.id}
                className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${
                  connector.disabled ? 'opacity-60' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
                        {connector.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-slate-900">{connector.name}</h3>
                          {isConnected && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Connected
                            </span>
                          )}
                          {connector.disabled && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-sm mt-1">{connector.description}</p>
                        {!connector.disabled && (
                          <a
                            href={connector.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
                          >
                            Get Credentials <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gmail Setup */}
                  {connector.id === 'gmail' && !connector.disabled && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                      {!isConnected ? (
                        <>
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
                            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                              <li>Go to Google Cloud Console</li>
                              <li>Create a new project or select existing</li>
                              <li>Enable Gmail API</li>
                              <li>Create OAuth 2.0 credentials (Web application)</li>
                              <li>Add redirect URI: <code className="bg-blue-100 px-1 rounded">{window.location.origin}/auth/gmail/callback</code></li>
                              <li>Copy Client ID below</li>
                            </ol>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              OAuth Client ID
                            </label>
                            <input
                              type="text"
                              value={config?.clientId || ''}
                              onChange={(e) => updateEmailConfig('gmail', 'clientId', e.target.value)}
                              placeholder="xxxxx.apps.googleusercontent.com"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                            />
                          </div>

                          <button
                            onClick={connectGmail}
                            disabled={!config?.clientId}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Link2 className="w-5 h-5" />
                            Connect Gmail Account
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <div>
                              <p className="font-medium text-slate-900">Connected as {config.email}</p>
                              <p className="text-sm text-slate-500">Ready to send emails and manage drafts</p>
                            </div>
                          </div>
                          <button
                            onClick={disconnectGmail}
                            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Unlink className="w-4 h-4" />
                            Disconnect
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Email Features Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Features
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Auto-send job applications with tailored resume & cover letter</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Save email drafts for review before sending</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Pre-built email templates for applications & follow-ups</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Track sent emails in application history</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Usage Tips */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Security & Usage Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
            <span>API keys are stored locally in your browser - never shared with our servers</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
            <span>Most APIs have free tiers sufficient for personal job searching</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
            <span>JSearch aggregates from 10+ platforms with just one API</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
            <span>Gmail OAuth uses secure token-based auth - no password stored</span>
          </div>
        </div>
      </div>
    </div>
  );
}
