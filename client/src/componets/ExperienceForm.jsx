import React, { useState, useContext } from 'react'
import { Plus, Trash2, Briefcase, Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppContext } from '../context/appContext'

const ExperienceForm = ({ data = [], onChange, onSave }) => {
  const { enhanceJobDescription } = useContext(AppContext);
  const [loadingIndex, setLoadingIndex] = useState(null);
  
  const addExperience = () => {
    const newExperience = {
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      description: "",
      is_current: false
    };
    onChange([...data, newExperience]);
  }

  const removeExperience = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  }

  const updateExperience = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  const handleEnhance = async (index) => {
    const currentDescription = data[index]?.description;
    if (!currentDescription || !currentDescription.trim()) {
      toast.error("Please write some job description first before enhancing.");
      return;
    }

    setLoadingIndex(index);
    const toastId = toast.loading("Enhancing job description with AI...");
    try {
      const enhanced = await enhanceJobDescription(currentDescription);
      updateExperience(index, "description", enhanced);
      toast.success("Job description enhanced successfully!", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Failed to enhance job description.", { id: toastId });
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header section with Add Experience button */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            Professional Experience
          </h3>
          <p className='text-sm text-gray-500'>
            Add your job experience
          </p>
        </div>
        <button 
          onClick={addExperience}
          className='flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 rounded-lg font-semibold transition-all duration-200 cursor-pointer'
        >
          <Plus className="size-4" />
          Add Experience
        </button>
      </div>

      {/* Conditional Experience List or Empty State */}
      {data.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 mt-6'>
          <Briefcase className='size-16 text-slate-300 mb-4' />
          <p className='font-semibold text-slate-700 text-base mb-1'>No work experience added yet.</p>
          <p className='text-sm text-slate-400 text-center px-4'>Click "Add Experience" to get started.</p>
        </div>
      ) : (
        <div className='space-y-6 mt-6'>
          {data.map((exp, index) => (
            <div key={index} className='p-5 border border-slate-200 rounded-xl bg-white space-y-4 relative group hover:shadow-md transition-all'>
              {/* Header row with Title and Remove Button */}
              <div className='flex justify-between items-center'>
                <span className='font-semibold text-gray-800 text-base'>Experience #{index + 1}</span>
                <button 
                  type="button"
                  onClick={() => removeExperience(index)}
                  className='text-red-500 hover:text-red-700 p-1.5 rounded transition-colors cursor-pointer'
                  title="Remove Experience"
                >
                  <Trash2 className='size-5' />
                </button>
              </div>

              {/* Inputs Grid - 2 Column */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <input 
                  type="text" 
                  value={exp.company || ""} 
                  onChange={(e) => updateExperience(index, "company", e.target.value)}
                  className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800'
                  placeholder='Company Name'
                />
                <input 
                  type="text" 
                  value={exp.position || ""} 
                  onChange={(e) => updateExperience(index, "position", e.target.value)}
                  className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800'
                  placeholder='Job Title'
                />
                <input 
                  type="date" 
                  value={exp.start_date || ""} 
                  onChange={(e) => updateExperience(index, "start_date", e.target.value)}
                  className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800'
                />
                <input 
                  type="date" 
                  value={exp.end_date || ""} 
                  onChange={(e) => updateExperience(index, "end_date", e.target.value)}
                  disabled={exp.is_current}
                  className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-400'
                />
              </div>

              {/* Is Current Checkbox */}
              <label className='flex items-center gap-2 cursor-pointer mt-1'>
                <input 
                  type="checkbox" 
                  checked={exp.is_current || false}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const updated = [...data];
                    updated[index] = { 
                      ...updated[index], 
                      is_current: isChecked,
                      end_date: isChecked ? "" : updated[index].end_date
                    };
                    onChange(updated);
                  }}
                  className='rounded border-slate-300 text-green-600 focus:ring-green-500/20 size-4'
                />
                <span className='text-sm text-slate-700 font-medium'>Currently working here</span>
              </label>

              {/* Job Description Header and Textarea */}
              <div className='space-y-2 mt-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm font-semibold text-slate-700'>Job Description</span>
                  <button 
                    type="button"
                    onClick={() => handleEnhance(index)}
                    disabled={loadingIndex === index}
                    className='flex items-center gap-1 px-2.5 py-1 text-xs bg-purple-500/10 text-purple-700 border border-purple-300/30 rounded-lg font-semibold hover:bg-purple-500/20 transition-colors cursor-pointer disabled:opacity-50'
                  >
                    {loadingIndex === index ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                    {loadingIndex === index ? 'Enhancing...' : 'Enhance with AI'}
                  </button>
                </div>
                <textarea 
                  value={exp.description || ""} 
                  onChange={(e) => updateExperience(index, "description", e.target.value)}
                  rows={5}
                  className='w-full p-3 px-4 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800 resize-none'
                  placeholder='Describe your key responsibilities and achievements...'
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
          onClick={onSave || (() => toast.success("Experience changes saved successfully."))}
          className='px-5 py-2.5 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-600 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer'
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default ExperienceForm;