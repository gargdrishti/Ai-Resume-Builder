import React from 'react'
import { Plus, Trash2, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

const EducationForm = ({ data = [], onChange, onSave }) => {

  const addEducation = () => {
    const newEducation = {
      institution: "",
      degree: "",
      field: "",
      graduation_date: "",
      gpa: ""
    };
    onChange([...data, newEducation]);
  };

  const removeEducation = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateEducation = (index, fieldName, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [fieldName]: value };
    onChange(updated);
  };

  return (
    <div className='space-y-6'>
      {/* Header section with Add Education button */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            Education
          </h3>
          <p className='text-sm text-gray-500'>
            Add your education details
          </p>
        </div>
        <button 
          onClick={addEducation}
          className='flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 rounded-lg font-semibold transition-all duration-200 cursor-pointer'
        >
          <Plus className="size-4" />
          Add Education
        </button>
      </div>

      {/* Conditional Education List or Empty State */}
      {data.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 mt-6'>
          <GraduationCap className='size-16 text-slate-300 mb-4' />
          <p className='font-semibold text-slate-700 text-base mb-1'>No education details added yet.</p>
          <p className='text-sm text-slate-400 text-center px-4'>Click "Add Education" to get started.</p>
        </div>
      ) : (
        <div className='space-y-6 mt-6'>
          {data.map((edu, index) => (
            <div key={index} className='p-5 border border-slate-200 rounded-xl bg-white space-y-4 relative group hover:shadow-md transition-all'>
              {/* Header row with Title and Remove Button */}
              <div className='flex justify-between items-center'>
                <span className='font-semibold text-gray-800 text-base'>Education #{index + 1}</span>
                <button 
                  type="button"
                  onClick={() => removeEducation(index)}
                  className='text-red-500 hover:text-red-700 p-1.5 rounded transition-colors cursor-pointer'
                  title="Remove Education"
                >
                  <Trash2 className='size-5' />
                </button>
              </div>

              {/* Inputs Grid - styled to match screenshot */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <input 
                  type="text" 
                  value={edu.institution || ""} 
                  onChange={(e) => updateEducation(index, "institution", e.target.value)}
                  className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800'
                  placeholder='Institution Name'
                />
                <input 
                  type="text" 
                  value={edu.degree || ""} 
                  onChange={(e) => updateEducation(index, "degree", e.target.value)}
                  className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800'
                  placeholder="Degree (e.g., Bachelor's, Master's)"
                />
                <input 
                  type="text" 
                  value={edu.field || ""} 
                  onChange={(e) => updateEducation(index, "field", e.target.value)}
                  className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800'
                  placeholder='Field of Study'
                />
                <input 
                  type="date" 
                  value={edu.graduation_date || ""} 
                  onChange={(e) => updateEducation(index, "graduation_date", e.target.value)}
                  className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800'
                />
                <input 
                  type="text" 
                  value={edu.gpa || ""} 
                  onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                  className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800'
                  placeholder='GPA (optional)'
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Changes Button at the bottom */}
      <div className='mt-6 flex'>
        <button 
          type="button"
          onClick={onSave || (() => toast.success("Education changes saved successfully."))}
          className='px-5 py-2.5 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-600 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer'
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default EducationForm;