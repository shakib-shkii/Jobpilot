import { useState, useRef } from 'react';
import { 
  User, Mail, Phone, MapPin, Link2, Globe, Briefcase, GraduationCap,
  Award, Code, FileText, Upload, Plus, X, Save, Edit2,
  Check, Trash2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Experience, Education, Certification } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { parseCV } from '../utils/aiEngine';

export function Profile() {
  const { currentUser, profile, updateUser, updateProfile, uploadCV, cvUploaded, cvFileName } = useStore();
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for editing
  const [editData, setEditData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
    linkedinUrl: currentUser?.linkedinUrl || '',
    portfolioUrl: currentUser?.portfolioUrl || '',
    githubUrl: currentUser?.githubUrl || '',
    summary: profile?.summary || '',
    skills: profile?.skills || [],
    remotePreference: profile?.remotePreference || 'flexible',
    visaSponsorshipRequired: profile?.visaSponsorshipRequired || false,
  });

  const [newSkill, setNewSkill] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>(profile?.experience || []);
  const [education, setEducation] = useState<Education[]>(profile?.education || []);
  const [certifications, setCertifications] = useState<Certification[]>(profile?.certifications || []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate CV parsing
    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result as string;
      const extractedData = parseCV(text);
      
      // Update profile with extracted data
      uploadCV(file.name, extractedData);
      
      if (extractedData.skills) {
        setEditData(prev => ({
          ...prev,
          skills: [...new Set([...prev.skills, ...extractedData.skills!])]
        }));
      }
    };
    
    reader.readAsText(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    updateUser({
      name: editData.name,
      email: editData.email,
      phone: editData.phone,
      location: editData.location,
      linkedinUrl: editData.linkedinUrl,
      portfolioUrl: editData.portfolioUrl,
      githubUrl: editData.githubUrl,
    });

    updateProfile({
      summary: editData.summary,
      skills: editData.skills,
      experience: experiences,
      education,
      certifications,
      remotePreference: editData.remotePreference as any,
      visaSponsorshipRequired: editData.visaSponsorshipRequired,
    });

    setIsSaving(false);
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !editData.skills.includes(newSkill.trim())) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, {
      id: uuidv4(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: null,
      current: false,
      description: '',
      achievements: []
    }]);
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setExperiences(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    setEducation(prev => [...prev, {
      id: uuidv4(),
      degree: '',
      field: '',
      institution: '',
      location: '',
      graduationDate: '',
    }]);
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setEducation(prev => prev.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id: string) => {
    setEducation(prev => prev.filter(edu => edu.id !== id));
  };

  const addCertification = () => {
    setCertifications(prev => [...prev, {
      id: uuidv4(),
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: ''
    }]);
  };

  const updateCertification = (id: string, field: string, value: string) => {
    setCertifications(prev => prev.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const removeCertification = (id: string) => {
    setCertifications(prev => prev.filter(cert => cert.id !== id));
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'certifications', label: 'Certifications', icon: Award },
  ];

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-6">
          {/* Profile Picture */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto text-white text-3xl font-bold">
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 className="font-semibold text-lg mt-3">{currentUser?.name || 'User'}</h3>
            <p className="text-sm text-slate-500">{currentUser?.email}</p>
          </div>

          {/* CV Upload */}
          <div className="mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed transition-all ${
                cvUploaded 
                  ? 'border-green-300 bg-green-50 text-green-700' 
                  : 'border-slate-300 hover:border-blue-500 text-slate-600 hover:text-blue-600'
              }`}
            >
              {cvUploaded ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="text-sm">{cvFileName}</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">Upload CV</span>
                </>
              )}
            </button>
          </div>

          {/* Section Navigation */}
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

          {/* Save/Edit Button */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            {isEditing ? (
              <div className="space-y-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
              >
                <Edit2 className="w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Personal Information */}
        {activeSection === 'personal' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Personal Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                icon={User}
                label="Full Name"
                value={editData.name}
                onChange={(v) => setEditData(p => ({ ...p, name: v }))}
                disabled={!isEditing}
              />
              <InputField
                icon={Mail}
                label="Email"
                type="email"
                value={editData.email}
                onChange={(v) => setEditData(p => ({ ...p, email: v }))}
                disabled={!isEditing}
              />
              <InputField
                icon={Phone}
                label="Phone"
                value={editData.phone}
                onChange={(v) => setEditData(p => ({ ...p, phone: v }))}
                disabled={!isEditing}
              />
              <InputField
                icon={MapPin}
                label="Location"
                value={editData.location}
                onChange={(v) => setEditData(p => ({ ...p, location: v }))}
                disabled={!isEditing}
              />
              <InputField
                icon={Link2}
                label="LinkedIn URL"
                value={editData.linkedinUrl}
                onChange={(v) => setEditData(p => ({ ...p, linkedinUrl: v }))}
                disabled={!isEditing}
              />
              <InputField
                icon={Globe}
                label="Portfolio URL"
                value={editData.portfolioUrl}
                onChange={(v) => setEditData(p => ({ ...p, portfolioUrl: v }))}
                disabled={!isEditing}
              />
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="font-medium text-slate-900 mb-4">Work Preferences</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Remote Preference</label>
                  <select
                    value={editData.remotePreference}
                    onChange={(e) => setEditData(p => ({ ...p, remotePreference: e.target.value as 'remote' | 'hybrid' | 'onsite' | 'flexible' }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                  >
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editData.visaSponsorshipRequired}
                      onChange={(e) => setEditData(p => ({ ...p, visaSponsorshipRequired: e.target.checked }))}
                      disabled={!isEditing}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-slate-700">Require Visa Sponsorship</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {activeSection === 'summary' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Professional Summary</h2>
            <textarea
              value={editData.summary}
              onChange={(e) => setEditData(p => ({ ...p, summary: e.target.value }))}
              disabled={!isEditing}
              placeholder="Write a brief summary about your professional background, key skills, and career objectives..."
              className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none resize-none disabled:opacity-60"
            />
            <p className="text-sm text-slate-500 mt-2">
              {editData.summary.length}/500 characters • A good summary is 100-200 words
            </p>
          </div>
        )}

        {/* Skills */}
        {activeSection === 'skills' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Skills</h2>
            
            {isEditing && (
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {editData.skills.map((skill) => (
                <span
                  key={skill}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
                    isEditing 
                      ? 'bg-blue-50 text-blue-700 pr-2' 
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="p-1 hover:bg-blue-100 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {editData.skills.length === 0 && (
              <p className="text-slate-500 text-center py-8">
                No skills added yet. {isEditing ? 'Add your skills above.' : 'Click Edit to add skills.'}
              </p>
            )}
          </div>
        )}

        {/* Experience */}
        {activeSection === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Work Experience</h2>
              {isEditing && (
                <button
                  onClick={addExperience}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Experience
                </button>
              )}
            </div>

            {experiences.map((exp) => (
              <div key={exp.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                {isEditing && (
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="float-right p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    value={exp.title}
                    onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Job Title"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                  />
                  <input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Company"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                  />
                  <input
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Location"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                    />
                    <input
                      type="date"
                      value={exp.endDate || ''}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      disabled={!isEditing || exp.current}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                      disabled={!isEditing}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-slate-600">Currently working here</span>
                  </label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Describe your responsibilities and achievements..."
                    className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none resize-none disabled:opacity-60"
                  />
                </div>
              </div>
            ))}

            {experiences.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No experience added yet</p>
              </div>
            )}
          </div>
        )}

        {/* Education */}
        {activeSection === 'education' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Education</h2>
              {isEditing && (
                <button
                  onClick={addEducation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Education
                </button>
              )}
            </div>

            {education.map((edu) => (
              <div key={edu.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                {isEditing && (
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="float-right p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Degree (e.g., Bachelor's)"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                  />
                  <input
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Field of Study"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                  />
                  <input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Institution"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                  />
                  <input
                    type="date"
                    value={edu.graduationDate}
                    onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                    disabled={!isEditing}
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                  />
                </div>
              </div>
            ))}

            {education.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No education added yet</p>
              </div>
            )}
          </div>
        )}

        {/* Certifications */}
        {activeSection === 'certifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Certifications</h2>
              {isEditing && (
                <button
                  onClick={addCertification}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Certification
                </button>
              )}
            </div>

            {certifications.map((cert) => (
              <div key={cert.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                {isEditing && (
                  <button
                    onClick={() => removeCertification(cert.id)}
                    className="float-right p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    value={cert.name}
                    onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Certification Name"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                  />
                  <input
                    value={cert.issuer}
                    onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Issuing Organization"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                  />
                  <input
                    type="date"
                    value={cert.issueDate}
                    onChange={(e) => updateCertification(cert.id, 'issueDate', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Issue Date"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                  />
                  <input
                    value={cert.credentialId || ''}
                    onChange={(e) => updateCertification(cert.id, 'credentialId', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Credential ID (Optional)"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
                  />
                </div>
              </div>
            ))}

            {certifications.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Award className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No certifications added yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface InputFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
}

function InputField({ icon: Icon, label, value, onChange, disabled, type = 'text' }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:opacity-60"
        />
      </div>
    </div>
  );
}
