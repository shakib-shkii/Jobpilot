# JobPilot AI 🚀

**Your AI-Powered Career Co-Pilot**

One platform. All job boards. Zero hassle.

JobPilot AI is a centralized job application platform where you can find jobs from multiple platforms, get AI-powered resume tailoring, automatic cover letter generation, and track all your applications in one place.

![JobPilot AI](https://img.shields.io/badge/JobPilot-AI%20Powered-blue)
![React](https://img.shields.io/badge/React-19.2-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC)

---

## ✨ Features

### 🔍 Multi-Platform Job Search
- Search jobs from **LinkedIn, Indeed, Jooble, Adzuna, RemoteOK, Greenhouse, Lever, Workday** and more
- Real-time API integration with JSearch, Adzuna, and RemoteOK
- GCC region priority (Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman)

### 🤖 AI-Powered Matching
- Automatic **Match Score** calculation for every job
- Skills, experience, title, and location matching
- Missing skills identification
- ATS optimization suggestions

### 📄 AI Document Generation
- **Tailored Resume** generation for each job
- **Custom Cover Letter** generation
- ATS score analysis
- Keyword optimization

### 📧 Email Integration
- Gmail OAuth2 integration
- Send applications directly from the app
- Save and manage email drafts
- Pre-built email templates

### 📊 Application Tracking
- Track all applications in one dashboard
- Status management (Pending, Submitted, Interview, Offer, Rejected)
- Application timeline
- Notes and follow-ups

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

```bash
# Clone or download the project
cd jobpilot-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
jobpilot-ai/
├── index.html                 # Entry HTML
├── package.json               # Dependencies
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── README.md                 # This file
└── src/
    ├── main.tsx              # App entry point
    ├── App.tsx               # Main app component
    ├── index.css             # Global styles
    ├── components/
    │   ├── Layout/
    │   │   ├── Sidebar.tsx   # Navigation sidebar
    │   │   └── Header.tsx    # Page header
    │   ├── Jobs/
    │   │   └── JobDetailModal.tsx  # Job details & apply
    │   └── Email/
    │       └── EmailComposer.tsx   # Email composition
    ├── pages/
    │   ├── Auth/
    │   │   ├── Login.tsx     # Login page
    │   │   └── Register.tsx  # Registration wizard
    │   ├── Dashboard.tsx     # Main dashboard
    │   ├── Jobs.tsx          # Job search
    │   ├── Profile.tsx       # User profile
    │   ├── Applications.tsx  # Application tracker
    │   ├── SavedJobs.tsx     # Bookmarked jobs
    │   ├── Documents.tsx     # Generated documents
    │   ├── Drafts.tsx        # Email drafts
    │   ├── Connectors.tsx    # API configuration
    │   ├── Settings.tsx      # User settings
    │   └── Admin.tsx         # Admin panel
    ├── store/
    │   └── useStore.ts       # Zustand state management
    ├── services/
    │   ├── jobApis.ts        # Job search API integrations
    │   └── emailService.ts   # Gmail API integration
    ├── utils/
    │   ├── cn.ts             # Tailwind class merger
    │   └── aiEngine.ts       # AI matching & generation
    ├── data/
    │   └── mockJobs.ts       # Sample job data
    └── types/
        └── index.ts          # TypeScript interfaces
```

---

## 🔑 Using the App

### 1. Login
- Use **any email and password** (demo mode)
- Example: `john@example.com` / `password123`

### 2. Complete Your Profile
1. Go to **Profile** page
2. Click **Edit Profile**
3. Add your **skills** (important for matching!)
4. Add work experience, education, certifications
5. Upload your CV (optional)

### 3. Search Jobs
1. Go to **Find Jobs**
2. Enter keywords (e.g., "Network Engineer")
3. Filter by location, country, remote, etc.
4. Click **Search** for local results
5. Click **Live** for real-time API results (requires API keys)

### 4. Apply to Jobs
1. Click on any job card
2. Review the **Match Analysis**
3. Click **Apply Now**
4. AI generates tailored resume & cover letter
5. For external jobs, click to complete on company site
6. Optionally, use **Email Application** to send directly

### 5. Track Applications
- View all applications in **Applications** page
- Update status as you progress
- Add notes for each application

---

## 🔌 API Connectors (Optional)

Enable real-time job search by connecting free APIs:

### JSearch (RapidAPI) - Recommended
Aggregates jobs from LinkedIn, Indeed, Glassdoor, ZipRecruiter, and more.

1. Sign up at [RapidAPI](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
2. Subscribe to free plan (200 requests/month)
3. Copy your API key
4. Go to **API Connectors** → Enable JSearch → Paste key

### Adzuna
Job aggregator with salary data across 16 countries.

1. Register at [Adzuna Developer](https://developer.adzuna.com/)
2. Create an app to get App ID and App Key
3. Add credentials in **API Connectors**

### RemoteOK
Free remote job listings - no API key required!

---

## 📧 Gmail Integration (Optional)

Send job applications directly via Gmail:

### Setup Steps
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Gmail API**
4. Go to **Credentials** → Create **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add Authorized redirect URI: `http://localhost:5173/auth/gmail/callback`
7. Copy the **Client ID**
8. In JobPilot AI, go to **API Connectors** → Gmail
9. Paste Client ID and click **Connect Gmail Account**

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🎨 Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **Zustand** - State management
- **Lucide React** - Icons
- **date-fns** - Date formatting

---

## 📱 Pages Overview

| Page | Description |
|------|-------------|
| **Dashboard** | Overview stats, recent apps, recommended jobs |
| **Find Jobs** | Search & filter jobs from all platforms |
| **Applications** | Track your job applications |
| **Saved Jobs** | Bookmarked jobs for later |
| **Documents** | Generated resumes & cover letters |
| **Email Drafts** | Saved email drafts |
| **Profile** | Your professional profile |
| **API Connectors** | Configure job & email APIs |
| **Settings** | App preferences |
| **Admin Panel** | Platform administration (admin only) |

---

## 🌍 Supported Job Platforms

| Platform | Integration Type |
|----------|-----------------|
| LinkedIn | Via JSearch API |
| Indeed | Via JSearch API |
| Glassdoor | Via JSearch API |
| ZipRecruiter | Via JSearch API |
| Adzuna | Direct API |
| RemoteOK | Direct API |
| USA Jobs | Direct API |
| The Muse | Direct API |
| Greenhouse | Mock data |
| Lever | Mock data |
| Workday | Mock data |

---

## 🔒 Security Notes

- API keys are stored **locally in your browser** (localStorage)
- No data is sent to external servers except the APIs you configure
- Gmail uses **OAuth2** - your password is never stored
- All sensitive fields are masked by default

---

## 📄 License

MIT License - feel free to use and modify!

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Built with ❤️ for job seekers everywhere**
