import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

const SkillsForm = ({ data = [], onChange, onSave }) => {
  const [newSkill, setNewSkill] = useState('')

  const handleAddSkill = (e) => {
    if (e) e.preventDefault()
    const trimmed = newSkill.trim()
    if (!trimmed) return

    if (data.includes(trimmed)) {
      toast.error('Skill already exists.')
      return
    }

    onChange([...data, trimmed])
    setNewSkill('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const removeSkill = (indexToRemove) => {
    const updated = data.filter((_, index) => index !== indexToRemove)
    onChange(updated)
  }

  return (
    <div className='space-y-6'>
      {/* Header section */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900'>
          Skills
        </h3>
        <p className='text-sm text-gray-500'>
          Add your technical and soft skills
        </p>
      </div>

      {/* Add Skill Input Form */}
      <form onSubmit={handleAddSkill} className='flex gap-3 mt-4'>
        <input 
          type="text" 
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          className='flex-1 px-4 py-2.5 border-2 border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm placeholder-slate-400 text-slate-800 transition-all'
          placeholder='Enter a skill (e.g., JavaScript, Project Management)'
        />
        <button 
          type="submit"
          className='flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors duration-200 cursor-pointer shadow-md shadow-blue-500/10'
        >
          <Plus className="size-4" />
          Add
        </button>
      </form>

      {/* Skills Tags Container */}
      {data.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-4'>
          {data.map((skill, index) => (
            <div 
              key={index} 
              className='bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-2'
            >
              <span>{skill}</span>
              <button 
                type="button"
                onClick={() => removeSkill(index)}
                className='text-blue-500 hover:text-blue-700 transition-colors cursor-pointer'
                title={`Remove ${skill}`}
              >
                <X className='size-3.5' />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tip Box - styled to match screenshot */}
      <div className='bg-blue-50 rounded-xl p-4 mt-6 text-sm text-blue-800 leading-relaxed'>
        <p>
          <span className="font-bold">Tip:</span> Add 8-12 relevant skills. Include both technical skills (programming languages, tools) and soft skills (leadership, communication).
        </p>
      </div>

      {/* Save Changes Button at the bottom */}
      <div className='mt-6 flex'>
        <button 
          type="button"
          onClick={onSave || (() => toast.success("Skills changes saved successfully."))}
          className='px-5 py-2.5 bg-green-100 hover:bg-green-200 text-green-700 border border-green-200 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer'
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default SkillsForm;