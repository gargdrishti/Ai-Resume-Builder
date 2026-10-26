import React from 'react';
import { Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, Folder } from 'lucide-react';

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

const CreativeTemplate = ({ data = {}, accentColor, ascentColor }) => {
  const activeColor = accentColor || ascentColor || '#6366f1';
  
  // Support both snake_case (database) and camelCase (raw AI output)
  const personalInfo = data.personal_info || data.personalInfo || {};
  const professionalSummary = data.professional_summary || data.professionalSummary || '';
  const experienceList = data.experience || [];
  const educationList = data.education || [];
  const projectsList = data.project || data.projects || [];
  const skillsList = data.skills || [];

  return (
    <div className="w-full min-h-[11in] bg-white flex flex-col md:flex-row text-slate-800 font-sans shadow-xs">
      {/* Left-hand Column (Accent Background) */}
      <div 
        style={{ backgroundColor: activeColor }}
        className="w-full md:w-1/3 p-6 text-white flex flex-col gap-6 shrink-0 print:w-1/3"
      >
        {/* Profile Image */}
        {personalInfo.image && (
          <div className="flex justify-center mb-2">
            <img 
              src={personalInfo.image} 
              alt={personalInfo.full_name || personalInfo.fullName || 'User Profile'} 
              className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-md"
            />
          </div>
        )}

        {/* Contact Info Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold tracking-wider uppercase border-b border-white/20 pb-1.5">Contact</h3>
          
          {personalInfo.email && (
            <div className="flex items-center gap-2 text-xs">
              <Mail className="size-3.5 shrink-0 opacity-80" />
              <span className="truncate">{personalInfo.email}</span>
            </div>
          )}
          
          {personalInfo.phone && (
            <div className="flex items-center gap-2 text-xs">
              <Phone className="size-3.5 shrink-0 opacity-80" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          
          {personalInfo.location && (
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="size-3.5 shrink-0 opacity-80" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          
          {personalInfo.website && (
            <div className="flex items-center gap-2 text-xs">
              <Globe className="size-3.5 shrink-0 opacity-80" />
              <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{personalInfo.website}</a>
            </div>
          )}
          
          {personalInfo.linkedin && (
            <div className="flex items-center gap-2 text-xs">
              <Linkedin className="size-3.5 shrink-0 opacity-80" />
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">LinkedIn</a>
            </div>
          )}
        </div>

        {/* Skills Section */}
        {skillsList.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wider uppercase border-b border-white/20 pb-1.5">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-white/15 hover:bg-white/25 text-white text-[10px] font-semibold py-1 px-2.5 rounded-full transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right-hand Column (White Background) */}
      <div className="flex-1 p-8 flex flex-col gap-6 print:p-8">
        {/* Header Block */}
        <div className="border-b-2 border-slate-100 pb-4">
          <h1 
            style={{ color: activeColor }}
            className="text-3xl font-black uppercase tracking-tight mb-1"
          >
            {personalInfo.full_name || personalInfo.fullName || 'Your Name'}
          </h1>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
            {personalInfo.profession || personalInfo.profession || 'Your Profession'}
          </p>
        </div>

        {/* Professional Summary */}
        {professionalSummary && (
          <div className="space-y-2">
            <h2 
              style={{ color: activeColor }}
              className="text-xs font-black tracking-widest uppercase flex items-center gap-2"
            >
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-600">
              {professionalSummary}
            </p>
          </div>
        )}

        {/* Professional Experience (Timeline style) */}
        {experienceList.length > 0 && (
          <div className="space-y-3">
            <h2 
              style={{ color: activeColor }}
              className="text-xs font-black tracking-widest uppercase flex items-center gap-2"
            >
              <Briefcase className="size-4" /> Experience
            </h2>
            
            <div className="relative border-l-2 border-slate-100 pl-5 ml-2.5 space-y-5">
              {experienceList.map((exp, index) => {
                const startDate = exp.start_date || exp.startDate || '';
                const endDate = exp.end_date || exp.endDate || '';
                const isCurrent = exp.is_current || exp.isCurrent || false;
                return (
                  <div key={index} className="relative">
                    {/* Timeline Marker node */}
                    <span 
                      style={{ backgroundColor: activeColor }}
                      className="absolute left-[-27px] top-1.5 size-3 rounded-full border-2 border-white"
                    ></span>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">{exp.position}</h3>
                        <p className="text-xs font-semibold text-slate-500">{exp.company}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase sm:text-right">
                        {startDate} — {isCurrent ? 'Present' : endDate}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-[11px] leading-relaxed text-slate-600 mt-1.5">
                        {exp.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {projectsList.length > 0 && (
          <div className="space-y-3">
            <h2 
              style={{ color: activeColor }}
              className="text-xs font-black tracking-widest uppercase flex items-center gap-2"
            >
              <Folder className="size-4" /> Projects
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {projectsList.map((proj, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-bold text-slate-800">{proj.name}</h3>
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

        {/* Education Section */}
        {educationList.length > 0 && (
          <div className="space-y-3">
            <h2 
              style={{ color: activeColor }}
              className="text-xs font-black tracking-widest uppercase flex items-center gap-2"
            >
              <GraduationCap className="size-4" /> Education
            </h2>
            
            <div className="space-y-3.5">
              {educationList.map((edu, index) => {
                const graduationDate = edu.graduation_date || edu.graduationDate || '';
                return (
                  <div key={index} className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">
                        {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500">{edu.institution}</p>
                      {edu.gpa && <p className="text-[10px] text-slate-400 mt-0.5">GPA: {edu.gpa}</p>}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase">
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

export default CreativeTemplate;
