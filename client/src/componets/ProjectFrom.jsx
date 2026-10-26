import React from 'react'
import { Plus, Trash2, FolderIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const ProjectForm = ({ data = [], onChange, onSave }) => {

  const addProject = () => {
    const newProject = {
      name: "",
      type: "",
      description: "",
      projectLink: "",
      githubLink: ""
    };
    onChange([...data, newProject]);
  };

  const removeProject = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateProject = (index, fieldName, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [fieldName]: value };
    onChange(updated);
  };

  return (
    <div className='space-y-6'>
      {/* Header section with Add Project button */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            Projects
          </h3>
          <p className='text-sm text-gray-500'>
            Add your projects
          </p>
        </div>
        <button 
          onClick={addProject}
          className='flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 rounded-lg font-semibold transition-all duration-200 cursor-pointer'
        >
          <Plus className="size-4" />
          Add Project
        </button>
      </div>

      {/* Conditional Project List or Empty State */}
      {data.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 mt-6'>
          <FolderIcon className='size-16 text-slate-300 mb-4' />
          <p className='font-semibold text-slate-700 text-base mb-1'>No projects added yet.</p>
          <p className='text-sm text-slate-400 text-center px-4'>Click "Add Project" to get started.</p>
        </div>
      ) : (
        <div className='space-y-6 mt-6'>
          {data.map((proj, index) => (
            <div key={index} className='p-5 border border-slate-200 rounded-xl bg-white space-y-4 relative group hover:shadow-md transition-all'>
              {/* Header row with Title and Remove Button */}
              <div className='flex justify-between items-center'>
                <span className='font-semibold text-gray-800 text-base'>Project #{index + 1}</span>
                <button 
                  type="button"
                  onClick={() => removeProject(index)}
                  className='text-red-500 hover:text-red-700 p-1.5 rounded transition-colors cursor-pointer'
                  title="Remove Project"
                >
                  <Trash2 className='size-5' />
                </button>
              </div>

              {/* Inputs List - styled to match screenshot */}
              <div className='flex flex-col gap-4'>
                <input 
                  type="text" 
                  value={proj.name || ""} 
                  onChange={(e) => updateProject(index, "name", e.target.value)}
                  className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800'
                  placeholder='Project Name'
                />
                <input 
                  type="text" 
                  value={proj.type || ""} 
                  onChange={(e) => updateProject(index, "type", e.target.value)}
                  className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800'
                  placeholder='Project Type'
                />

                {/* Optional links */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <input 
                    type="url" 
                    value={proj.projectLink || ""} 
                    onChange={(e) => updateProject(index, "projectLink", e.target.value)}
                    className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800'
                    placeholder='Project Link (optional)'
                  />
                  <input 
                    type="url" 
                    value={proj.githubLink || ""} 
                    onChange={(e) => updateProject(index, "githubLink", e.target.value)}
                    className='w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800'
                    placeholder='GitHub Link (optional)'
                  />
                </div>

                <textarea 
                  value={proj.description || ""} 
                  onChange={(e) => updateProject(index, "description", e.target.value)}
                  rows={4}
                  className='w-full p-3 px-4 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm text-slate-800 resize-none'
                  placeholder='Describe your project...'
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
          onClick={onSave || (() => toast.success("Project changes saved successfully."))}
          className='px-5 py-2.5 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-600 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer'
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default ProjectForm;