import { useState, useEffect } from 'react';
import { 
  FileText, Trash2, Send, Eye, Clock, Building2, 
  Mail, AlertCircle, CheckCircle2
} from 'lucide-react';
import { 
  getEmailDrafts, 
  deleteLocalDraft, 
  updateDraftStatus,
  sendGmailEmail,
  getEmailConfig,
  EmailDraft 
} from '../services/emailService';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export function Drafts() {
  const { jobs } = useStore();
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null);
  const [sendingDraft, setSendingDraft] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const emailConfig = getEmailConfig();

  useEffect(() => {
    setDrafts(getEmailDrafts());
  }, []);

  const getJobForDraft = (jobId?: string) => {
    if (!jobId) return null;
    return jobs.find(j => j.id === jobId);
  };

  const handleDelete = (draftId: string) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      deleteLocalDraft(draftId);
      setDrafts(getEmailDrafts());
      if (selectedDraft?.id === draftId) {
        setSelectedDraft(null);
      }
    }
  };

  const handleSend = async (draft: EmailDraft) => {
    if (!emailConfig.gmail.connected) {
      setStatus({ type: 'error', message: 'Please connect Gmail in API Connectors first' });
      return;
    }

    if (!draft.to) {
      setStatus({ type: 'error', message: 'No recipient email address' });
      return;
    }

    setSendingDraft(draft.id);
    setStatus(null);

    try {
      const result = await sendGmailEmail(draft.to, draft.subject, draft.body);
      
      if (result.success) {
        updateDraftStatus(draft.id, 'sent');
        setDrafts(getEmailDrafts());
        setStatus({ type: 'success', message: 'Email sent successfully!' });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to send email' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: String(error) });
    }

    setSendingDraft(null);
  };

  const getStatusColor = (status: EmailDraft['status']) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Email Drafts</h2>
              <p className="text-slate-500">{drafts.length} drafts saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
          status.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Drafts List */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-4">
          {drafts.length > 0 ? (
            drafts.map((draft) => {
              const job = getJobForDraft(draft.jobId);
              return (
                <div 
                  key={draft.id}
                  onClick={() => setSelectedDraft(draft)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedDraft?.id === draft.id 
                      ? 'border-blue-500 ring-2 ring-blue-500/20' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900 truncate">{draft.subject || 'No subject'}</span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">To: {draft.to || 'No recipient'}</p>
                      {job && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                          <Building2 className="w-3 h-3" />
                          {job.title} at {job.company}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(draft.status)}`}>
                      {draft.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(draft.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                    <div className="flex items-center gap-2">
                      {draft.status === 'draft' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSend(draft);
                          }}
                          disabled={sendingDraft === draft.id || !emailConfig.gmail.connected}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                          title="Send"
                        >
                          {sendingDraft === draft.id ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(draft.id);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No drafts saved</h3>
              <p className="text-slate-500">
                Email drafts you save will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {selectedDraft ? (
            <>
              <div className="bg-slate-50 border-b border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Draft Preview</h3>
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(selectedDraft.status)}`}>
                    {selectedDraft.status}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">TO</label>
                  <p className="text-slate-900">{selectedDraft.to || 'No recipient'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">SUBJECT</label>
                  <p className="text-slate-900">{selectedDraft.subject || 'No subject'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">MESSAGE</label>
                  <div className="mt-2 p-4 bg-slate-50 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                      {selectedDraft.body}
                    </pre>
                  </div>
                </div>
                {selectedDraft.attachments && selectedDraft.attachments.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-slate-500">ATTACHMENTS</label>
                    <div className="mt-2 space-y-2">
                      {selectedDraft.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <FileText className="w-4 h-4" />
                          {att.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-200 p-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleDelete(selectedDraft.id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
                {selectedDraft.status === 'draft' && (
                  <button
                    onClick={() => handleSend(selectedDraft)}
                    disabled={sendingDraft === selectedDraft.id || !emailConfig.gmail.connected}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {sendingDraft === selectedDraft.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Email
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <Eye className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>Select a draft to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
