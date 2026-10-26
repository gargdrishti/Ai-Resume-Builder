import { User, Mail, Phone, MapPin, BriefcaseBusiness, Globe } from 'lucide-react'
import React from 'react'
import toast from 'react-hot-toast'

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
)

// Configuration array extracted from image_14e23f.png
const fields = [
    { key: "full_name", label: "Full Name", icon: User, type: "text", required: true },
    { key: "email", label: "Email Address", icon: Mail, type: "email", required: true },
    { key: "phone", label: "Phone Number", icon: Phone, type: "tel" },
    { key: "location", label: "Location", icon: MapPin, type: "text" },
    { key: "profession", label: "Profession", icon: BriefcaseBusiness, type: "text" },
    { key: "linkedin", label: "LinkedIn Profile", icon: Linkedin, type: "url" },
    { key: "website", label: "Personal Website", icon: Globe, type: "url" }
]

const PersonalInfoForm = ({ data, onChange, removeBackground, setRemoveBackground }) => {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="max-w-xl space-y-6">
            <div>
                <h3 className='text-lg font-semibold text-gray-900'>Personal Information</h3>
                <p className='text-sm text-gray-600'>Get Started with the personal information</p>
                
                {/* Image Upload section from image_147926.jpg */}
                <div className='flex items-center gap-2'>
                    <label className="cursor-pointer">
                        {data.image ? (
                            <img 
                                src={typeof data.image === 'string' ? data.image : URL.createObjectURL(data.image)} 
                                alt="user-image" 
                                className='w-16 h-16 rounded-full object-cover mt-5 ring ring-slate-300 hover:opacity-80'
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full mt-5 bg-gray-100 flex items-center justify-center border border-slate-300">
                                <User className="text-gray-400" />
                            </div>
                        )}
                        <input 
                            type="file" 
                            accept="image/jpeg, image/png" 
                            className="hidden" 
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    handleChange('image', file);
                                }
                            }} 
                        />
                    </label>

                    {/* Toggle Switch from image_14d37a.jpg */}
                    {typeof data.image === 'object' && (
                        <div className='flex flex-col gap-1 pl-4 text-sm mt-5'>
                            <p className="text-xs font-medium text-gray-700">Remove Background</p>
                            <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    onChange={() => setRemoveBackground(prev => !prev)} 
                                    checked={removeBackground}
                                />
                                <div className='w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200'></div>
                                <span className='dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4'></span>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Dynamically mapped input fields - styled to match screenshot */}
            <div className="flex flex-col gap-5 mt-6">
                {fields.map((field) => {
                    const IconComponent = field.icon;
                    return (
                        <div key={field.key} className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <IconComponent className="size-4 text-slate-500" />
                                <span>{field.label}</span>
                                {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type={field.type}
                                required={field.required || false}
                                value={data[field.key] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm placeholder-slate-400 text-slate-800 transition-all"
                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Save Changes Button - styled to match screenshot */}
            <div className="mt-6 flex">
                <button
                    type="button"
                    onClick={() => toast.success("Changes saved successfully.")}
                    className="px-5 py-2 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-600 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                >
                    Save Changes
                </button>
            </div>
        </div>
    )
}

export default PersonalInfoForm;