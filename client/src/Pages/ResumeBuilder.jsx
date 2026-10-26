import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { User, FileText, Briefcase, GraduationCap, FolderIcon, Sparkles, ChevronLeft, ChevronRight, Share2 as Share2Icon, Eye as EyeIcon, EyeOff as EyeOffIcon, Download as DownloadIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import OnboardingTour from '../componets/OnboardingTour';
import PersonalInfoForm from '../componets/PersonalInfoForm';
import ResumePreview from '../componets/ResumePreview';
import TemplateSelector from '../componets/TemplateSelector';
import ColorPicker from '../componets/ColorPicker';
import ProfessionalSummaryForm from '../componets/ProfessionalSummaryFrom';
import ExperienceForm from '../componets/ExperienceForm';
import EducationForm from '../componets/EducationForm';
import ProjectForm from '../componets/ProjectFrom';
import SkillsForm from '../componets/SkillsForm';
import { AppContext } from '../context/appContext';

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const { getResumeById, updateResume, sendResumePreviewEmail } = useContext(AppContext);
  const [resumeData, setResumeData] = useState({
    _id: '',
    title: '',
    personal_info: {},
    professional_summary: '',
    experience: [],
    education: [],
    project: [],
    skills: [],
    template: 'classic',
    accent_color: '#3B82F6',
    public: false,
  });

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [activeTab, setActiveTab] = useState('form');

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
  ];

  const activeSection = sections[activeSectionIndex];

  const loadExistingResume = async () => {
    try {
      const resume = await getResumeById(resumeId);
      if (resume) {
        setResumeData(resume);
        document.title = resume.title || 'Resume Builder';
      }
    } catch (err) {
      toast.error("Failed to load resume.");
    }
  };

  useEffect(() => {
    loadExistingResume();
  }, [resumeId]);

  const handleSave = async (updatedData = resumeData) => {
    const toastId = toast.loading("Saving changes...");
    try {
      let imageFile = null;
      if (updatedData.personal_info && typeof updatedData.personal_info.image === 'object') {
        imageFile = updatedData.personal_info.image;
      }
      const updated = await updateResume(resumeId, updatedData, imageFile, removeBackground);
      setResumeData(updated);
      toast.success("Changes saved successfully.", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Failed to save changes.", { id: toastId });
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/view/${resumeId}`;
    
    // 1. Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: resumeData.title || 'My Resume',
          text: `Check out my resume: ${resumeData.title || ''}`,
          url: shareUrl
        });
        toast.success("Shared successfully.");
        return;
      } catch (error) {
        // If the user cancelled or it failed, we log and fallback to copy
        console.log('Native share failed or cancelled:', error);
      }
    }

    // 2. Bulletproof copy-to-clipboard fallback (works in non-secure HTTP / IP contexts too)
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard.");
      } else {
        // Fallback for non-secure HTTP contexts
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) {
          toast.success("Share link copied to clipboard.");
        } else {
          throw new Error('Fallback copy failed');
        }
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error("Failed to copy share link.");
    }
  };

  const handleExportDocx = async () => {
    const toastId = toast.loading("Generating Word document...");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URI || 'http://localhost:3000'}/api/resumes/${resumeId}/export/docx`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) {
        throw new Error("Failed to export Word document");
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.title.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Word document exported successfully.", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to export Word document.", { id: toastId });
    }
  };

  const tourSteps = [
    {
      target: '#step-navigation-container',
      title: 'Form Step Navigator',
      content: 'Click Prev or Next to navigate through your contact details, summary, experience, education, projects, and skills sections.',
      position: 'bottom'
    },
    {
      target: '#template-accent-container',
      title: 'Templates & Accent Colors',
      content: 'Choose from different layouts (Classic, Modern, Developer, Creative, Academic) and customize the brand colors of your CV.',
      position: 'bottom'
    },
    {
      target: '#action-buttons-container',
      title: 'Visibility & File Exports',
      content: 'Set your CV to Public to enable web sharing, or download the optimized output in recruiter-approved PDF and Word formats.',
      position: 'bottom'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 print:p-0 print:max-w-none print:w-full">
      <OnboardingTour steps={tourSteps} tourKey="builder" />
      {/* Dashboard Top Header Bar */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-slate-800">Resume Builder</h1>
        <Link to="/app" className="text-sm text-green-600 hover:text-green-700 font-semibold">
          Back to Dashboard
        </Link>
      </div>
      
      {/* Main Split Layout Workspace */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        
        {/* Mobile View Tab Switcher */}
        <div className="flex bg-white border border-slate-200 rounded-xl p-1.5 mb-6 lg:hidden shadow-2xs print:hidden">
          <button 
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'form' 
                ? 'bg-green-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
            }`}
          >
            Edit Form
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'preview' 
                ? 'bg-green-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
            }`}
          >
            Preview Resume
          </button>
        </div>

        <div className='grid lg:grid-cols-12 gap-8'>
          
          {/* Left Panel - Form */}
          <div className={`relative lg:col-span-5 rounded-lg overflow-hidden ${activeTab === 'form' ? 'block' : 'hidden lg:block'} print:hidden`}>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1'>
              
              {/* Progress bar at the very top edge of the card container */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 rounded-t-lg overflow-hidden">
                <div 
                  className="bg-green-550 h-full bg-green-500 transition-all duration-300" 
                  style={{ width: `${((activeSectionIndex + 1) / sections.length) * 100}%` }}
                />
              </div>

              {/* Section Navigation with Progress Bar, Template & Accent Selector */}
              <div className="flex flex-col gap-4 mb-6 border-b border-gray-200 pb-4 mt-4">
                {/* Top Row: Step Info & Nav Buttons */}
                <div id="step-navigation-container" className="flex justify-between items-center">
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Step {activeSectionIndex + 1} of {sections.length}
                    </span>
                  </div>

                  {/* Prev / Next Buttons */}
                  <div className="flex items-center gap-1">
                    {activeSectionIndex !== 0 && (
                      <button 
                        onClick={() => setActiveSectionIndex((prevIndex) => Math.max(prevIndex - 1, 0))} 
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all shadow-2xs"
                      >
                        <ChevronLeft className="size-3.5"/> Prev
                      </button>
                    )}

                    <button 
                      onClick={() => setActiveSectionIndex((prevIndex) => Math.min(prevIndex + 1, sections.length - 1))} 
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-755 hover:bg-slate-50 border border-slate-200 transition-all shadow-2xs"
                      disabled={activeSectionIndex === sections.length - 1}
                    >
                      Next <ChevronRight className="size-3.5"/>
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Selectors next to each other */}
                <div id="template-accent-container" className="flex items-center gap-2.5 pt-1">
                  <TemplateSelector 
                    selectedTemplate={resumeData.template} 
                    onChange={async (template) => {
                      setResumeData(prev => ({ ...prev, template }));
                      try {
                        await updateResume(resumeId, { ...resumeData, template }, null, removeBackground);
                      } catch (err) {
                        console.error("Failed to save template selection:", err);
                      }
                    }}
                  />
                  <ColorPicker 
                    selectedColor={resumeData.accent_color} 
                    onChange={async (color) => {
                      setResumeData(prev => ({ ...prev, accent_color: color }));
                      try {
                        await updateResume(resumeId, { ...resumeData, accent_color: color }, null, removeBackground);
                      } catch (err) {
                        console.error("Failed to save accent color:", err);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Form Content */}
              <div className='space-y-6'>
                {activeSection.id === 'personal' && (
                  <PersonalInfoForm 
                    data={resumeData.personal_info || {}}
                    onChange={(updatedPersonalInfo) => setResumeData(prev => ({ ...prev, personal_info: updatedPersonalInfo }))}
                    removeBackground={removeBackground}
                    setRemoveBackground={setRemoveBackground}
                    onSave={() => handleSave()}
                  />
                )}
                {activeSection.id === 'summary' && (
                  <ProfessionalSummaryForm 
                    data={resumeData.professional_summary}
                    onChange={(updatedSummary) => setResumeData(prev => ({ ...prev, professional_summary: updatedSummary }))}
                    setResumeData={setResumeData}
                    onSave={() => handleSave()}
                  />
                )}
                {activeSection.id === 'experience' && (
                  <ExperienceForm 
                    data={resumeData.experience || []}
                    onChange={(updatedExperience) => setResumeData(prev => ({ ...prev, experience: updatedExperience }))}
                    onSave={() => handleSave()}
                  />
                )}
                {activeSection.id === 'education' && (
                  <EducationForm 
                    data={resumeData.education || []}
                    onChange={(updatedEducation) => setResumeData(prev => ({ ...prev, education: updatedEducation }))}
                    onSave={() => handleSave()}
                  />
                )}
                {activeSection.id === 'projects' && (
                  <ProjectForm 
                    data={resumeData.project || []}
                    onChange={(updatedProjects) => setResumeData(prev => ({ ...prev, project: updatedProjects }))}
                    onSave={() => handleSave()}
                  />
                )}
                {activeSection.id === 'skills' && (
                  <SkillsForm 
                    data={resumeData.skills || []}
                    onChange={(updatedSkills) => setResumeData(prev => ({ ...prev, skills: updatedSkills }))}
                    onSave={() => handleSave()}
                  />
                )}
                {activeSection.id !== 'personal' && activeSection.id !== 'summary' && activeSection.id !== 'experience' && activeSection.id !== 'education' && activeSection.id !== 'projects' && activeSection.id !== 'skills' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-slate-700">
                      {React.createElement(activeSection.icon, { className: "size-5" })}
                      <h3 className="text-lg font-bold">{activeSection.name}</h3>
                    </div>
                    <p className="text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl p-8 text-center">
                      Form components for {activeSection.name} section go here.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className={`lg:col-span-7 max-lg:mt-6 ${activeTab === 'preview' ? 'block' : 'hidden lg:block'} print:block print:col-span-12 print:w-full print:max-w-none print:m-0 print:p-0`}>
            {/* Action Buttons: Share, Privacy (Public/Private), and Download */}
            <div className="flex flex-col mb-6 border-t border-gray-300 pt-4 print:hidden">
              <div id="action-buttons-container" className="flex flex-wrap justify-end items-center gap-2">
                {resumeData.public && (
                  <button 
                    onClick={handleShare}
                    className='flex items-center p-2 px-4 gap-2 text-xs from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors cursor-pointer shadow-sm'
                    title="Share Resume"
                  >
                    <Share2Icon className='size-4'/>
                    Share
                  </button>
                )}
                <button 
                  onClick={async () => {
                    const nextPublic = !resumeData.public;
                    setResumeData(prev => ({ ...prev, public: nextPublic }));
                    try {
                      await updateResume(resumeId, { ...resumeData, public: nextPublic }, null, removeBackground);
                      toast.success(nextPublic ? "Resume is now public." : "Resume is now private.");
                    } catch (err) {
                      setResumeData(prev => ({ ...prev, public: !nextPublic }));
                      toast.error("Failed to update visibility.");
                    }
                  }}
                  className='flex items-center p-2 px-4 gap-2 text-xs  from-purple-100 to-purple-200 text-purple-600 ring-purple-300 rounded-lg hover:ring transition-colors cursor-pointer shadow-sm'
                  title={resumeData.public ? "Make Private" : "Make Public"}
                >
                  {resumeData.public ? <EyeIcon className="size-4"/> : <EyeOffIcon className="size-4"/>}
                  {resumeData.public ? 'Public' : 'Private'}
                </button>
                <button 
                  onClick={() => {
                    toast.success("Opening print dialog. Select 'Save as PDF' to download your CV.", { duration: 4000 });
                    window.print();
                  }}
                  className='flex items-center gap-2 px-4 py-2 text-xs  from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors cursor-pointer shadow-sm'
                  title="Download Resume as PDF"
                >
                  <DownloadIcon className='size-4'/> PDF
                </button>
                <button 
                  onClick={handleExportDocx}
                  className='flex items-center gap-2 px-4 py-2 text-xs  from-indigo-100 to-indigo-200 text-indigo-600 rounded-lg ring-indigo-300 hover:ring transition-colors cursor-pointer shadow-sm'
                  title="Download Resume as Word (DOCX)"
                >
                  <DownloadIcon className='size-4'/> Word (DOCX)
                </button>
              </div>

              {/* Vanity URL (Custom Public Link) Config Card */}
              {resumeData.public && (
                <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl mt-3 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Custom Public Link (Vanity URL)
                    </label>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-md">
                      AI & ATS Optimization Active
                    </span>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 mt-1">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 grow max-w-full overflow-hidden text-xs text-slate-500 font-medium select-all shadow-2xs">
                      <span className="truncate">{window.location.origin}/view/</span>
                      <input 
                        type="text" 
                        placeholder="your-custom-slug"
                        className="bg-transparent text-slate-800 font-bold outline-none border-none ml-0.5 w-full min-w-28 focus:text-green-755 focus:text-green-700 placeholder-slate-300"
                        value={resumeData.slug || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResumeData(prev => ({ ...prev, slug: val }));
                        }}
                        onBlur={() => handleSave()}
                        title="Enter a custom slug and press Save or click outside"
                      />
                    </div>
                    <button 
                      onClick={() => handleSave()}
                      className="px-4 py-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-xs rounded-lg transition shadow-sm cursor-pointer shrink-0"
                    >
                      Save Link
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Use lowercase letters, numbers, and hyphens only (e.g., <span className="font-semibold text-slate-500">john-doe</span>). Leave blank to clear.
                  </p>
                </div>
              )}
            </div>

            <ResumePreview 
              data={resumeData} 
              template={resumeData.template} 
              accentColor={resumeData.accent_color}
            />
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default ResumeBuilder;