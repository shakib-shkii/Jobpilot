// Email Service - Gmail API Integration
// Handles OAuth2 authentication, sending emails, and managing drafts

export interface EmailConfig {
  gmail: {
    enabled: boolean;
    clientId: string;
    accessToken: string;
    refreshToken: string;
    email: string;
    connected: boolean;
  };
  outlook: {
    enabled: boolean;
    clientId: string;
    accessToken: string;
    email: string;
    connected: boolean;
  };
}

export interface EmailDraft {
  id: string;
  to: string;
  subject: string;
  body: string;
  attachments: { name: string; content: string; type: string }[];
  jobId?: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'failed';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

// Default email configuration
const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  gmail: {
    enabled: false,
    clientId: '',
    accessToken: '',
    refreshToken: '',
    email: '',
    connected: false,
  },
  outlook: {
    enabled: false,
    clientId: '',
    accessToken: '',
    email: '',
    connected: false,
  },
};

// Gmail API scopes required
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email',
];

export function getEmailConfig(): EmailConfig {
  const saved = localStorage.getItem('jobpilot_email_config');
  if (saved) {
    return { ...DEFAULT_EMAIL_CONFIG, ...JSON.parse(saved) };
  }
  return DEFAULT_EMAIL_CONFIG;
}

export function saveEmailConfig(config: EmailConfig): void {
  localStorage.setItem('jobpilot_email_config', JSON.stringify(config));
}

// Get saved drafts
export function getEmailDrafts(): EmailDraft[] {
  const saved = localStorage.getItem('jobpilot_email_drafts');
  return saved ? JSON.parse(saved) : [];
}

// Save drafts
export function saveEmailDrafts(drafts: EmailDraft[]): void {
  localStorage.setItem('jobpilot_email_drafts', JSON.stringify(drafts));
}

// Get email templates
export function getEmailTemplates(): EmailTemplate[] {
  const saved = localStorage.getItem('jobpilot_email_templates');
  if (saved) {
    return JSON.parse(saved);
  }
  
  // Default templates
  return [
    {
      id: '1',
      name: 'Job Application',
      subject: 'Application for {{jobTitle}} Position at {{company}}',
      body: `Dear Hiring Manager,

I am writing to express my interest in the {{jobTitle}} position at {{company}}. With my background in {{skills}}, I believe I would be a valuable addition to your team.

{{coverLetterBody}}

I have attached my tailored resume for your review. I am excited about the opportunity to contribute to {{company}} and would welcome the chance to discuss how my skills align with your needs.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
{{userName}}
{{userEmail}}
{{userPhone}}`,
      variables: ['jobTitle', 'company', 'skills', 'coverLetterBody', 'userName', 'userEmail', 'userPhone'],
    },
    {
      id: '2',
      name: 'Follow-up Email',
      subject: 'Following Up - {{jobTitle}} Application',
      body: `Dear Hiring Manager,

I hope this email finds you well. I wanted to follow up on my application for the {{jobTitle}} position at {{company}} that I submitted on {{applicationDate}}.

I remain very interested in this opportunity and would appreciate any updates on the status of my application. I am confident that my skills in {{skills}} would be a great fit for your team.

Please let me know if you need any additional information from me.

Thank you for your time and consideration.

Best regards,
{{userName}}
{{userEmail}}`,
      variables: ['jobTitle', 'company', 'applicationDate', 'skills', 'userName', 'userEmail'],
    },
    {
      id: '3',
      name: 'Thank You After Interview',
      subject: 'Thank You - {{jobTitle}} Interview',
      body: `Dear {{interviewerName}},

Thank you so much for taking the time to meet with me today to discuss the {{jobTitle}} position at {{company}}.

I enjoyed learning more about the role and {{company}}'s goals. Our conversation reinforced my enthusiasm for the opportunity, and I am confident that my experience in {{skills}} would enable me to contribute effectively to your team.

I look forward to the possibility of working together and contributing to {{company}}'s continued success.

Please don't hesitate to reach out if you need any additional information.

Thank you again for this opportunity.

Best regards,
{{userName}}`,
      variables: ['interviewerName', 'jobTitle', 'company', 'skills', 'userName'],
    },
  ];
}

export function saveEmailTemplates(templates: EmailTemplate[]): void {
  localStorage.setItem('jobpilot_email_templates', JSON.stringify(templates));
}

// Gmail OAuth2 - Generate auth URL
export function getGmailAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GMAIL_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Exchange auth code for tokens (requires backend in production)
export async function exchangeGmailCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token: string; email: string } | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    const data = await response.json();
    
    // Get user email
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
      },
    });
    
    const userInfo = await userInfoResponse.json();
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      email: userInfo.email,
    };
  } catch (error) {
    console.error('Gmail OAuth error:', error);
    return null;
  }
}

// Send email via Gmail API
export async function sendGmailEmail(
  to: string,
  subject: string,
  body: string,
  options: {
    attachments?: { name: string; content: string; mimeType: string }[];
    cc?: string;
    bcc?: string;
    replyTo?: string;
  } = {}
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getEmailConfig();
  
  if (!config.gmail.connected || !config.gmail.accessToken) {
    return { success: false, error: 'Gmail not connected' };
  }

  try {
    // Construct email in RFC 2822 format
    let email = '';
    const boundary = '----=_Part_' + Math.random().toString(36).substring(2);
    
    email += `To: ${to}\r\n`;
    email += `From: ${config.gmail.email}\r\n`;
    if (options.cc) email += `Cc: ${options.cc}\r\n`;
    if (options.bcc) email += `Bcc: ${options.bcc}\r\n`;
    if (options.replyTo) email += `Reply-To: ${options.replyTo}\r\n`;
    email += `Subject: ${subject}\r\n`;
    
    if (options.attachments && options.attachments.length > 0) {
      email += `MIME-Version: 1.0\r\n`;
      email += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
      
      // Email body
      email += `--${boundary}\r\n`;
      email += `Content-Type: text/html; charset=utf-8\r\n\r\n`;
      email += body.replace(/\n/g, '<br>') + '\r\n\r\n';
      
      // Attachments
      for (const attachment of options.attachments) {
        email += `--${boundary}\r\n`;
        email += `Content-Type: ${attachment.mimeType}; name="${attachment.name}"\r\n`;
        email += `Content-Disposition: attachment; filename="${attachment.name}"\r\n`;
        email += `Content-Transfer-Encoding: base64\r\n\r\n`;
        email += attachment.content + '\r\n';
      }
      
      email += `--${boundary}--`;
    } else {
      email += `Content-Type: text/html; charset=utf-8\r\n\r\n`;
      email += body.replace(/\n/g, '<br>');
    }

    // Encode to base64url
    const encodedEmail = btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.gmail.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedEmail }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to send email');
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Gmail send error:', error);
    return { success: false, error: String(error) };
  }
}

// Create Gmail draft
export async function createGmailDraft(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; draftId?: string; error?: string }> {
  const config = getEmailConfig();
  
  if (!config.gmail.connected || !config.gmail.accessToken) {
    return { success: false, error: 'Gmail not connected' };
  }

  try {
    let email = '';
    email += `To: ${to}\r\n`;
    email += `From: ${config.gmail.email}\r\n`;
    email += `Subject: ${subject}\r\n`;
    email += `Content-Type: text/html; charset=utf-8\r\n\r\n`;
    email += body.replace(/\n/g, '<br>');

    const encodedEmail = btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/drafts',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.gmail.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: { raw: encodedEmail },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create draft');
    }

    const data = await response.json();
    return { success: true, draftId: data.id };
  } catch (error) {
    console.error('Gmail draft error:', error);
    return { success: false, error: String(error) };
  }
}

// List Gmail drafts
export async function listGmailDrafts(): Promise<any[]> {
  const config = getEmailConfig();
  
  if (!config.gmail.connected || !config.gmail.accessToken) {
    return [];
  }

  try {
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/drafts?maxResults=20',
      {
        headers: {
          'Authorization': `Bearer ${config.gmail.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch drafts');
    }

    const data = await response.json();
    return data.drafts || [];
  } catch (error) {
    console.error('Gmail list drafts error:', error);
    return [];
  }
}

// Parse email template with variables
export function parseEmailTemplate(
  template: EmailTemplate,
  variables: Record<string, string>
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  }

  return { subject, body };
}

// Auto-generate application email
export function generateApplicationEmail(
  job: { title: string; company: string },
  user: { name: string; email: string; phone: string },
  coverLetter: string,
  skills: string[]
): { to: string; subject: string; body: string } {
  const template = getEmailTemplates().find(t => t.name === 'Job Application');
  
  if (!template) {
    return {
      to: '',
      subject: `Application for ${job.title} Position at ${job.company}`,
      body: coverLetter,
    };
  }

  const { subject, body } = parseEmailTemplate(template, {
    jobTitle: job.title,
    company: job.company,
    skills: skills.slice(0, 5).join(', '),
    coverLetterBody: coverLetter,
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
  });

  return { to: '', subject, body };
}

// Save local draft (not Gmail)
export function saveLocalDraft(draft: Omit<EmailDraft, 'id' | 'createdAt' | 'status'>): EmailDraft {
  const drafts = getEmailDrafts();
  const newDraft: EmailDraft = {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'draft',
  };
  drafts.push(newDraft);
  saveEmailDrafts(drafts);
  return newDraft;
}

// Update draft status
export function updateDraftStatus(draftId: string, status: EmailDraft['status']): void {
  const drafts = getEmailDrafts();
  const index = drafts.findIndex(d => d.id === draftId);
  if (index !== -1) {
    drafts[index].status = status;
    saveEmailDrafts(drafts);
  }
}

// Delete draft
export function deleteLocalDraft(draftId: string): void {
  const drafts = getEmailDrafts().filter(d => d.id !== draftId);
  saveEmailDrafts(drafts);
}
