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

const DeveloperTemplate = ({ data = {}, accentColor, ascentColor }) => {
  const activeColor = accentColor || ascentColor || '#0ea5e9'; // Default cyan-500 for dev theme
  
  // Support both snake_case (database) and camelCase (raw AI output)
  const personalInfo = data.personal_info || data.personalInfo || {};
  const professionalSummary = data.professional_summary || data.professionalSummary || '';
  const experienceList = data.experience || [];
  const educationList = data.education || [];
  const projectsList = data.project || data.projects || [];
  const skillsList = data.skills || [];

  return (
    <div className="w-full min-h-[11in] bg-slate-950 p-10 text-slate-300 font-mono shadow-xs print:p-8 print:bg-white print:text-slate-800">
      {/* Header Block */}
      <div className="border-b border-slate-800 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start gap-6 print:border-slate-200">
        <div className="flex-1 space-y-2">
          {/* Code syntax style decoration */}
          <div className="text-slate-500 text-xs font-bold print:text-slate-400">
            <span className="text-yellow-500">import</span> &#123; Developer &#125; <span className="text-yellow-500">from</span> <span className="text-emerald-500">'universe'</span>;
          </div>
          
          <h1 className="text-3xl font-black tracking-tight text-white print:text-slate-950">
            {personalInfo.full_name || personalInfo.fullName || 'Your Name'}
          </h1>
          
          <p 
            style={{ color: activeColor }}
            className="text-sm font-bold tracking-wider uppercase"
          >
            &lt; {personalInfo.profession || personalInfo.profession || 'Fullstack Developer'} /&gt;
          </p>

          {/* Contact Details in terminal shell style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-400 mt-4 print:text-slate-600">
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 shrink-0" style={{ color: activeColor }} />
                <span className="truncate">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 shrink-0" style={{ color: activeColor }} />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 shrink-0" style={{ color: activeColor }} />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-2">
                <Globe className="size-3.5 shrink-0" style={{ color: activeColor }} />
                <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{personalInfo.website}</a>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="size-3.5 shrink-0" style={{ color: activeColor }} />
                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">LinkedIn</a>
              </div>
            )}
          </div>
        </div>

        {/* Profile Image (Tech Border) */}
        {personalInfo.image && (
          <div className="shrink-0 max-sm:mx-auto relative">
            {/* Decorative corners */}
            <div 
              style={{ borderColor: activeColor }}
              className="absolute -top-1 -left-1 size-3 border-t-2 border-l-2 pointer-events-none"
            ></div>
            <div 
              style={{ borderColor: activeColor }}
              className="absolute -bottom-1 -right-1 size-3 border-b-2 border-r-2 pointer-events-none"
            ></div>
            
            <img 
              src={personalInfo.image} 
              alt={personalInfo.full_name || personalInfo.fullName || 'User Profile'} 
              className="w-28 h-28 object-cover bg-slate-900 border border-slate-800 rounded-none print:border-slate-200"
            />
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="space-y-6">
        
        {/* Summary */}
        {professionalSummary && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold tracking-wider uppercase flex items-center gap-1.5 text-white print:text-slate-900">
              <span style={{ color: activeColor }}>&lt;</span> Summary <span style={{ color: activeColor }}>/&gt;</span>
            </h2>
            <p className="text-xs leading-relaxed text-slate-400 text-justify print:text-slate-600">
              {professionalSummary}
            </p>
          </div>
        )}

        {/* Skills Section (Heavy Highlight, Pill Badges) */}
        {skillsList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold tracking-wider uppercase flex items-center gap-1.5 text-white print:text-slate-900">
              <span style={{ color: activeColor }}>&lt;</span> Skills <span style={{ color: activeColor }}>/&gt;</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, index) => (
                <span 
                  key={index} 
                  style={{ 
                    backgroundColor: `${activeColor}15`, 
                    color: activeColor, 
                    borderColor: `${activeColor}30` 
                  }}
                  className="text-xs font-bold px-3 py-1 rounded-sm border hover:bg-opacity-25 transition-all cursor-default print:bg-slate-50 print:border-slate-200 print:text-slate-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {experienceList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold tracking-wider uppercase flex items-center gap-1.5 text-white print:text-slate-900">
              <span style={{ color: activeColor }}>&lt;</span> Experience <span style={{ color: activeColor }}>/&gt;</span>
            </h2>
            <div className="space-y-4">
              {experienceList.map((exp, index) => {
                const startDate = exp.start_date || exp.startDate || '';
                const endDate = exp.end_date || exp.endDate || '';
                const isCurrent = exp.is_current || exp.isCurrent || false;
                return (
                  <div key={index} className="border-l-2 pl-4 py-0.5 border-slate-800 space-y-1.5 print:border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <div>
                        <h3 className="text-xs font-bold text-white print:text-slate-900">
                          {exp.position}
                        </h3>
                        <p className="text-xs text-slate-500 font-bold print:text-slate-400">
                          @ {exp.company}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase shrink-0">
                        {startDate} - {isCurrent ? 'Present' : endDate}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-xs leading-relaxed text-slate-400 print:text-slate-600 text-justify">
                        {exp.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Projects Section (Emphasized) */}
        {projectsList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold tracking-wider uppercase flex items-center gap-1.5 text-white print:text-slate-900">
              <span style={{ color: activeColor }}>&lt;</span> Projects <span style={{ color: activeColor }}>/&gt;</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
              {projectsList.map((proj, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xs flex flex-col justify-between gap-2 hover:border-slate-750 transition-colors print:bg-white print:border-slate-200 print:p-3"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xs font-bold text-white print:text-slate-900">
                        <span style={{ color: activeColor }}>$</span> {proj.name}
                      </h3>
                      {proj.type && (
                        <span 
                          style={{ borderColor: `${activeColor}40`, color: activeColor }}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm border uppercase shrink-0 print:border-slate-200 print:text-slate-500"
                        >
                          {proj.type}
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-[11px] leading-relaxed text-slate-400 print:text-slate-600">
                        {proj.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Decorative Repo status */}
                  <div className="text-[9px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-800 print:border-slate-100 print:text-slate-400">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: activeColor }}></span>
                    <span>main</span>
                    <span>•</span>
                    <span>100% complete</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {educationList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold tracking-wider uppercase flex items-center gap-1.5 text-white print:text-slate-900">
              <span style={{ color: activeColor }}>&lt;</span> Education <span style={{ color: activeColor }}>/&gt;</span>
            </h2>
            <div className="space-y-3">
              {educationList.map((edu, index) => {
                const graduationDate = edu.graduation_date || edu.graduationDate || '';
                return (
                  <div key={index} className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-white print:text-slate-900">
                        {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                      </h3>
                      <p className="text-xs text-slate-500 print:text-slate-400">{edu.institution}</p>
                      {edu.gpa && (
                        <span className="text-[10px] text-slate-500 font-bold print:text-slate-400">
                          GPA: {edu.gpa}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase shrink-0">
                      {graduationDate}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DeveloperTemplate;
