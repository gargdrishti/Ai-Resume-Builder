import React from 'react';
import { Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, Folder, Award } from 'lucide-react';

const Linkedin = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const ExecutiveTemplate = ({ data = {}, accentColor, ascentColor }) => {
  const activeColor = accentColor || ascentColor || '#1e293b'; // Default slate-800 for high-end look
  
  // Support both snake_case (database) and camelCase (raw AI output)
  const personalInfo = data.personal_info || data.personalInfo || {};
  const professionalSummary = data.professional_summary || data.professionalSummary || '';
  const experienceList = data.experience || [];
  const educationList = data.education || [];
  const projectsList = data.project || data.projects || [];
  const skillsList = data.skills || [];

  return (
    <div className="w-full min-h-[11in] bg-white p-10 text-slate-800 font-sans shadow-xs print:p-8">
      {/* Top Header Block (Minimalist & Text-Focused) */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b pb-6 mb-6 gap-4 print:flex-row">
        <div className="space-y-1">
          <h1 className="text-3xl font-light tracking-tight text-slate-900 uppercase">
            {personalInfo.full_name || personalInfo.fullName || 'Your Name'}
          </h1>
          <p 
            style={{ color: activeColor }}
            className="text-xs font-bold uppercase tracking-widest"
          >
            {personalInfo.profession || personalInfo.profession || 'Your Profession'}
          </p>
        </div>

        {/* Contact Details in a Clean Vertical Column */}
        <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-medium md:text-right print:text-right">
          {personalInfo.email && (
            <div className="flex items-center md:justify-end gap-1.5">
              <span>{personalInfo.email}</span>
              <Mail className="size-3 text-slate-400 shrink-0" />
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center md:justify-end gap-1.5">
              <span>{personalInfo.phone}</span>
              <Phone className="size-3 text-slate-400 shrink-0" />
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center md:justify-end gap-1.5">
              <span>{personalInfo.location}</span>
              <MapPin className="size-3 text-slate-400 shrink-0" />
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center md:justify-end gap-1.5">
              <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{personalInfo.website}</a>
              <Globe className="size-3 text-slate-400 shrink-0" />
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center md:justify-end gap-1.5">
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
              <Linkedin className="size-3 text-slate-400 shrink-0" />
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Layout Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 print:grid-cols-12">
        
        {/* Left Column (Academic Background, Skills) - 4/12 width */}
        <div className="md:col-span-4 space-y-6 print:col-span-4">
          
          {/* Executive Summary (if narrow layout selected) */}
          {personalInfo.image && (
            <div className="mb-4">
              <img 
                src={personalInfo.image} 
                alt={personalInfo.full_name || personalInfo.fullName || 'User Profile'} 
                className="w-full aspect-square object-cover rounded-lg shadow-xs grayscale hover:grayscale-0 transition duration-300"
              />
            </div>
          )}

          {/* Education */}
          {educationList.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 flex items-center gap-1.5">
                <GraduationCap className="size-4 text-slate-400" /> Education
              </h2>
              <hr style={{ borderColor: activeColor }} className="border-t opacity-30" />
              <div className="space-y-4">
                {educationList.map((edu, index) => {
                  const graduationDate = edu.graduation_date || edu.graduationDate || '';
                  return (
                    <div key={index} className="space-y-0.5">
                      <h3 className="text-xs font-bold text-slate-800">{edu.institution}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {edu.degree}{edu.field ? ` — ${edu.field}` : ''}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{graduationDate}</p>
                      {edu.gpa && <p className="text-[10px] text-slate-400">GPA: {edu.gpa}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core Competencies (Skills) */}
          {skillsList.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 flex items-center gap-1.5">
                <Award className="size-4 text-slate-400" /> Core Skills
              </h2>
              <hr style={{ borderColor: activeColor }} className="border-t opacity-30" />
              <div className="flex flex-col gap-2">
                {skillsList.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span style={{ backgroundColor: activeColor }} className="size-1.5 rounded-full shrink-0"></span>
                    <span className="text-[11px] text-slate-600 font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Experience, Projects) - 8/12 width */}
        <div className="md:col-span-8 space-y-6 print:col-span-8">
          
          {/* Executive Profile Summary */}
          {professionalSummary && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950">
                Executive Profile
              </h2>
              <hr style={{ borderColor: activeColor }} className="border-t opacity-30" />
              <p className="text-xs leading-relaxed text-slate-600 font-normal">
                {professionalSummary}
              </p>
            </div>
          )}

          {/* Professional Experience (Extensive Breathing Room) */}
          {experienceList.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 flex items-center gap-1.5">
                <Briefcase className="size-4 text-slate-400" /> Professional Experience
              </h2>
              <hr style={{ borderColor: activeColor }} className="border-t opacity-30" />
              
              <div className="space-y-6">
                {experienceList.map((exp, index) => {
                  const startDate = exp.start_date || exp.startDate || '';
                  const endDate = exp.end_date || exp.endDate || '';
                  const isCurrent = exp.is_current || exp.isCurrent || false;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-baseline gap-2">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                          <p className="text-xs font-medium text-slate-500">{exp.company}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide shrink-0">
                          {startDate} — {isCurrent ? 'Present' : endDate}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-[11px] leading-relaxed text-slate-600 pl-3 border-l-2 border-slate-100">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Projects */}
          {projectsList.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 flex items-center gap-1.5">
                <Folder className="size-4 text-slate-400" /> Key Projects
              </h2>
              <hr style={{ borderColor: activeColor }} className="border-t opacity-30" />
              <div className="space-y-4">
                {projectsList.map((proj, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-850">{proj.name}</h3>
                      {proj.type && <span className="text-[9px] font-bold text-slate-400 uppercase">{proj.type}</span>}
                    </div>
                    {proj.description && (
                      <p className="text-[10px] leading-relaxed text-slate-600">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveTemplate;
