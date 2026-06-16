import { useState, useEffect } from 'react';
import { 
  X, Send, Save, Paperclip, Mail, User, FileText,
  ChevronDown, Sparkles, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Job } from '../../types';
import { useStore } from '../../store/useStore';
import { 
  getEmailConfig, 
  getEmailTemplates, 
  parseEmailTemplate,
  sendGmailEmail,
  createGmailDraft,
  saveLocalDraft,
  EmailTemplate
} from '../../services/emailService';

interface EmailComposerProps {
  job?: Job;
  coverLetter?: string;
  resumeContent?: string;
  onClose: () => void;
  onSent?: () => void;
}

export function EmailComposer({ job, coverLetter, resumeContent, onClose, onSent }: EmailComposerProps) {
  const { currentUser, profile } = useStore();
  const emailConfig = getEmailConfig();
  const templates = getEmailTemplates();
  
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [attachResume, setAttachResume] = useState(true);
  const [attachCoverLetter, setAttachCoverLetter] = useState(true);

  // Initialize with job application template if job is provided
  useEffect(() => {
    if (job && currentUser) {
      const applicationTemplate = templates.find(t => t.name === 'Job Application');
      if (applicationTemplate) {
        const { subject: parsedSubject, body: parsedBody } = parseEmailTemplate(applicationTemplate, {
          jobTitle: job.title,
          company: job.company,
          skills: profile?.skills.slice(0, 5).join(', ') || 'relevant skills',
          coverLetterBody: coverLetter || 'I am writing to express my strong interest in this position.',
          userName: currentUser.name,
          userEmail: currentUser.email,
          userPhone: currentUser.phone || '',
        });
        setSubject(parsedSubject);
        setBody(parsedBody);
        setSelectedTemplate(applicationTemplate);
      }
    }
  }, [job, currentUser, profile, coverLetter, templates]);

  const applyTemplate = (template: EmailTemplate) => {
    const variables: Record<string, string> = {
      jobTitle: job?.title || '[Job Title]',
      company: job?.company || '[Company]',
      skills: profile?.skills.slice(0, 5).join(', ') || '[Skills]',
      coverLetterBody: coverLetter || '[Your cover letter content]',
      userName: currentUser?.name || '[Your Name]',
      userEmail: currentUser?.email || '[Your Email]',
      userPhone: currentUser?.phone || '[Your Phone]',
      applicationDate: new Date().toLocaleDateString(),
      interviewerName: '[Interviewer Name]',
    };

    const { subject: parsedSubject, body: parsedBody } = parseEmailTemplate(template, variables);
    setSubject(parsedSubject);
    setBody(parsedBody);
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleSend = async () => {
    if (!to) {
      setStatus({ type: 'error', message: 'Please enter recipient email address' });
      return;
    }

    if (!emailConfig.gmail.connected) {
      setStatus({ type: 'error', message: 'Please connect Gmail in API Connectors first' });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const attachments: { name: string; content: string; mimeType: string }[] = [];
      
      if (attachResume && resumeContent) {
        attachments.push({
          name: `Resume_${currentUser?.name?.replace(/\s+/g, '_')}.txt`,
          content: btoa(unescape(encodeURIComponent(resumeContent))),
          mimeType: 'text/plain',
        });
      }

      if (attachCoverLetter && coverLetter) {
        attachments.push({
          name: `CoverLetter_${job?.company?.replace(/\s+/g, '_')}.txt`,
          content: btoa(unescape(encodeURIComponent(coverLetter))),
          mimeType: 'text/plain',
        });
      }

      const result = await sendGmailEmail(to, subject, body, { attachments });

      if (result.success) {
        setStatus({ type: 'success', message: 'Email sent successfully!' });
        
        // Save to local drafts as sent
        saveLocalDraft({
          to,
          subject,
          body,
          attachments: attachments.map(a => ({ name: a.name, content: 'attached', type: a.mimeType })),
          jobId: job?.id,
        });

        setTimeout(() => {
          onSent?.();
          onClose();
        }, 1500);
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to send email' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: String(error) });
    }

    setIsSending(false);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setStatus(null);

    try {
      if (emailConfig.gmail.connected) {
        // Save to Gmail drafts
        const result = await createGmailDraft(to, subject, body);
        if (result.success) {
          setStatus({ type: 'success', message: 'Draft saved to Gmail!' });
        } else {
          throw new Error(result.error);
        }
      } else {
        // Save locally
        saveLocalDraft({
          to,
          subject,
          body,
          attachments: [],
          jobId: job?.id,
        });
        setStatus({ type: 'success', message: 'Draft saved locally!' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: String(error) });
    }

    setIsSavingDraft(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6" />
            <h2 className="text-lg font-semibold">
              {job ? `Apply to ${job.title}` : 'Compose Email'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gmail Connection Warning */}
        {!emailConfig.gmail.connected && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">
              Gmail not connected. Connect in <strong>API Connectors</strong> to send emails directly.
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Template Selector */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {selectedTemplate ? selectedTemplate.name : 'Use Template'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
            </button>

            {showTemplates && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg z-10">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl border-b border-slate-100 last:border-0"
                  >
                    <p className="font-medium text-slate-900">{template.name}</p>
                    <p className="text-sm text-slate-500 truncate">{template.subject}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* To Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>

          {/* Body Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Your message..."
              rows={12}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Attachments */}
          {(resumeContent || coverLetter) && (
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments
              </p>
              <div className="space-y-2">
                {resumeContent && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attachResume}
                      onChange={(e) => setAttachResume(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600"
                    />
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-700">Tailored Resume</span>
                  </label>
                )}
                {coverLetter && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attachCoverLetter}
                      onChange={(e) => setAttachCoverLetter(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600"
                    />
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-slate-700">Cover Letter</span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Status Message */}
          {status && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
              status.type === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{status.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 flex items-center justify-between">
          <button
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSavingDraft ? (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Draft
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !emailConfig.gmail.connected}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
