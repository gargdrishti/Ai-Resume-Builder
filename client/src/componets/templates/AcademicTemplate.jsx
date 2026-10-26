import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

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

const AcademicTemplate = ({ data = {}, accentColor, ascentColor }) => {
  const activeColor = accentColor || ascentColor || '#1e3a8a'; // Default dark blue for academic CV
  
  // Support both snake_case (database) and camelCase (raw AI output)
  const personalInfo = data.personal_info || data.personalInfo || {};
  const professionalSummary = data.professional_summary || data.professionalSummary || '';
  const educationList = data.education || [];
  const experienceList = data.experience || [];
  const projectsList = data.project || data.projects || [];
  const skillsList = data.skills || [];

  return (
    <div className="w-full min-h-[11in] bg-white p-10 text-slate-900 font-serif shadow-xs print:p-8">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 pb-6 mb-6 gap-6" style={{ borderColor: activeColor }}>
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {personalInfo.full_name || personalInfo.fullName || 'Your Name'}
          </h1>
          <p className="text-sm font-semibold text-slate-600 tracking-wide uppercase italic">
            {personalInfo.profession || personalInfo.profession || 'Researcher / Educator'}
          </p>
          
          {/* Contact Details (Academic style, comma-separated or small grid) */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600 font-sans mt-3">
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <Mail className="size-3.5" style={{ color: activeColor }} />
                <span>{personalInfo.email}</span>
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <Phone className="size-3.5" style={{ color: activeColor }} />
                <span>{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" style={{ color: activeColor }} />
                <span>{personalInfo.location}</span>
              </span>
            )}
            {personalInfo.website && (
              <span className="flex items-center gap-1">
                <Globe className="size-3.5" style={{ color: activeColor }} />
                <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{personalInfo.website}</a>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="size-3.5" style={{ color: activeColor }} />
                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
              </span>
            )}
          </div>
        </div>

        {/* Profile Image (Top Right, formal academic style) */}
        {personalInfo.image && (
          <div className="shrink-0 max-sm:mx-auto">
            <img 
              src={personalInfo.image} 
              alt={personalInfo.full_name || personalInfo.fullName || 'User Profile'} 
              className="w-28 h-32 object-cover border border-slate-200 rounded-xs shadow-xs"
            />
          </div>
        )}
      </div>

      {/* Main Single Column Layout */}
      <div className="space-y-6">
        {/* Professional Summary */}
        {professionalSummary && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold tracking-wider uppercase border-b pb-1" style={{ borderColor: `${activeColor}40`, color: activeColor }}>
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 text-justify">
              {professionalSummary}
            </p>
          </div>
        )}

        {/* Education (PLACED FIRST FOR ACADEMIC CV!) */}
        {educationList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold tracking-wider uppercase border-b pb-1" style={{ borderColor: `${activeColor}40`, color: activeColor }}>
              Education
            </h2>
            <div className="space-y-4">
              {educationList.map((edu, index) => {
                const graduationDate = edu.graduation_date || edu.graduationDate || '';
                return (
                  <div key={index} className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-slate-900">
                        {edu.institution}
                      </h3>
                      <p className="text-xs text-slate-700 font-medium">
                        {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                      </p>
                      {edu.gpa && (
                        <p className="text-[10px] text-slate-500 font-sans">
                          GPA: {edu.gpa}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-500 font-sans shrink-0">
                      {graduationDate}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Professional Experience */}
        {experienceList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold tracking-wider uppercase border-b pb-1" style={{ borderColor: `${activeColor}40`, color: activeColor }}>
              Professional Appointments
            </h2>
            <div className="space-y-5">
              {experienceList.map((exp, index) => {
                const startDate = exp.start_date || exp.startDate || '';
                const endDate = exp.end_date || exp.endDate || '';
                const isCurrent = exp.is_current || exp.isCurrent || false;
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between items-baseline gap-4">
                      <h3 className="text-xs font-bold text-slate-900">
                        {exp.position} — <span className="text-slate-600 font-medium">{exp.company}</span>
                      </h3>
                      <span className="text-xs font-bold text-slate-500 font-sans shrink-0">
                        {startDate} — {isCurrent ? 'Present' : endDate}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-xs leading-relaxed text-slate-700 text-justify">
                        {exp.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Research / Key Projects */}
        {projectsList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold tracking-wider uppercase border-b pb-1" style={{ borderColor: `${activeColor}40`, color: activeColor }}>
              Research & Projects
            </h2>
            <div className="space-y-4">
              {projectsList.map((proj, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-bold text-slate-900">{proj.name}</h3>
                    {proj.type && <span className="text-[10px] font-bold text-slate-500 font-sans uppercase">{proj.type}</span>}
                  </div>
                  {proj.description && (
                    <p className="text-xs leading-relaxed text-slate-700 text-justify">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Areas of Expertise */}
        {skillsList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold tracking-wider uppercase border-b pb-1" style={{ borderColor: `${activeColor}40`, color: activeColor }}>
              Areas of Expertise
            </h2>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs text-slate-755 pl-4 list-none font-sans">
              {skillsList.map((skill, index) => (
                <li key={index} className="relative pl-4">
                  <span 
                    style={{ backgroundColor: activeColor }}
                    className="absolute left-0 top-1.5 size-1.5 rounded-full"
                  ></span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicTemplate;
