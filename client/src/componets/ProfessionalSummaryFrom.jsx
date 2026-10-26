import React, { useState, useContext } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppContext } from '../context/appContext'

const ProfessionalSummaryForm = ({ data, onChange, onSave }) => {
    const { enhanceProfessionalSummary } = useContext(AppContext);
    const [loading, setLoading] = useState(false);

    const handleEnhance = async () => {
        if (!data || !data.trim()) {
            toast.error("Please write some summary text first before enhancing.");
            return;
        }
        
        setLoading(true);
        const toastId = toast.loading("Enhancing professional summary with AI...");
        try {
            const enhanced = await enhanceProfessionalSummary(data);
            onChange(enhanced);
            toast.success("Summary enhanced successfully!", { id: toastId });
        } catch (err) {
            toast.error(err.message || "Failed to enhance summary.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'> Professional Summary </h3>
                    <p className='text-sm text-gray-500'>Add summary for your resume here</p>
                </div>
                <button 
                    onClick={handleEnhance}
                    disabled={loading}
                    className='flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50 cursor-pointer font-semibold'
                >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4"/>}
                    {loading ? 'Enhancing...' : 'AI Enhance'}
                </button>
            </div>

            <div className="mt-6">
                <textarea 
                    value={data || ""} 
                    onChange={(e) => onChange(e.target.value)} 
                    rows={7} 
                    className='w-full p-3 px-4 mt-2 border text-sm border-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none text-slate-800' 
                    placeholder='Write a compelling professional summary that highlights your key strengths and career objectives...' 
                />
                <p className='text-xs text-gray-500 max-w-4/5 mx-auto text-center mt-3'>Tip: Keep it concise (3-4 sentences) and focus on your most relevant achievements and skills.</p>
            </div>

            {/* Save Changes Button - styled to match screenshot */}
            <div className="mt-6 flex">
                <button
                    type="button"
                    onClick={onSave || (() => toast.success("Changes saved successfully."))}
                    className="px-5 py-2.5 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-600 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
                >
                    Save Changes
                </button>
            </div>
        </div>
    )
}

export default ProfessionalSummaryForm;