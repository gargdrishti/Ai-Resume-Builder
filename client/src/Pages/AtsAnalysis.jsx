import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, AlertTriangle, CheckCircle, FileText, RefreshCw, Edit3, Loader2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppContext } from '../context/appContext'

const AtsAnalysis = () => {
  const { resumeId } = useParams()
  const navigate = useNavigate()
  const { getResumeById, analyzeResumeATS, user, createCheckoutSession } = useContext(AppContext)

  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)

  const steps = [
    {
      id: 1,
      title: "Layout & Formatting Audit",
      desc: "Checking document structure, font consistency, and section margins...",
      threshold: 20
    },
    {
      id: 2,
      title: "Keyword Density Analysis",
      desc: "Comparing skills and experience text against industry-standard ATS filters...",
      threshold: 45
    },
    {
      id: 3,
      title: "Summary & Impact Check",
      desc: "Evaluating the strength of your professional summary and objective...",
      threshold: 70
    },
    {
      id: 4,
      title: "Action Verb & Metrics Audit",
      desc: "Auditing work experience for strong action verbs and quantifiable results...",
      threshold: 90
    },
    {
      id: 5,
      title: "Report Compilation",
      desc: "Synthesizing AI insights and compiling custom recommendations...",
      threshold: 99
    }
  ]

  // Simulate progress when analyzing
  useEffect(() => {
    let interval;
    if (analyzing) {
      setProgress(0)
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95 // Hold at 95% until API resolves
          }
          // Increment faster at first, then slow down
          const diff = prev < 50 ? 5 : (prev < 80 ? 3 : 1)
          return prev + diff
        })
      }, 200)
    } else {
      setProgress(0)
    }
    return () => clearInterval(interval)
  }, [analyzing])

  const loadData = async (forceAnalyze = false) => {
    setLoading(true)
    try {
      const resData = await getResumeById(resumeId)
      setResume(resData)

      // If user is free, DO NOT trigger the AI analysis
      if (user && !user.isPremium) {
        setLoading(false)
        return
      }

      // If no analysis exists or force is true, trigger AI analysis
      if (!resData.atsAnalysis || forceAnalyze) {
        setAnalyzing(true)
        await analyzeResumeATS(resumeId)
        setProgress(100) // Complete progress bar
        
        // Brief delay to show 100% completion state
        await new Promise(resolve => setTimeout(resolve, 600))
        
        // Refresh local resume state with new analysis
        const updatedResume = await getResumeById(resumeId)
        setResume(updatedResume)
        toast.success(forceAnalyze ? "ATS analysis updated." : "ATS analysis completed.")
      }
    } catch (err) {
      console.error(err)
      toast.error(err.message || "Failed to load ATS report.")
    } finally {
      setLoading(false)
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [resumeId])

  // Guard: If the user is on the Free tier, render the premium lock screen
  if (!loading && !analyzing && user && !user.isPremium) {
    return (
      <div className="min-h-[85vh] py-16 flex items-center justify-center px-6 bg-slate-50/40">
        <div className="max-w-md w-full bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Top highlight gradient bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-green-400 via-emerald-500 to-teal-600"></div>

          {/* Glowing Lock Icon */}
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-6 shadow-2xs">
            <Lock className="size-10 text-emerald-600 animate-pulse" />
          </div>

          <h2 className="text-2xl font-black text-slate-950 tracking-tight">ATS Audit Locked</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Premium Pro Feature</p>
          
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-4 px-2">
            AI-powered ATS optimization scoring, detailed shortcomings analyses, and keyword recommendations are only available on the **Pro Plan**.
          </p>

          {/* Features Checklist */}
          <div className="w-full bg-slate-50 border border-slate-100/70 p-4 rounded-2xl text-left space-y-3 mt-6">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
              <CheckCircle className="size-4 text-emerald-600 shrink-0" />
              <span>Unlimited resume creations</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
              <CheckCircle className="size-4 text-emerald-600 shrink-0" />
              <span>Full AI ATS compatibility audit</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
              <CheckCircle className="size-4 text-emerald-600 shrink-0" />
              <span>Detailed shortcomings & remedies list</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
              <CheckCircle className="size-4 text-emerald-600 shrink-0" />
              <span>Custom Public URLs (Vanity slugs)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
              <CheckCircle className="size-4 text-emerald-600 shrink-0" />
              <span>Microsoft Word (.docx) exports</span>
            </div>
          </div>

          {/* Action buttons */}
          <button
            onClick={async () => {
              try {
                const loadingToast = toast.loading("Redirecting to Stripe Checkout...")
                const checkoutUrl = await createCheckoutSession()
                toast.dismiss(loadingToast)
                if (checkoutUrl) window.location.href = checkoutUrl
              } catch (err) {
                toast.dismiss()
                toast.error("Failed to start checkout. Please try again.")
              }
            }}
            className="w-full py-3.5 mt-8 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles className="size-4 text-white animate-pulse" />
            Upgrade to Pro for $10/mo
          </button>

          <button
            onClick={() => navigate('/app')}
            className="w-full py-3.5 mt-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="size-4 text-slate-500" /> Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading || analyzing) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center bg-slate-50/60 p-6">
        <div className="max-w-xl w-full bg-white/95 backdrop-blur-md border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center relative overflow-hidden">
          
          {/* Subtle colorful top highlight gradient bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-green-400 via-emerald-500 to-teal-600"></div>

          {/* Premium Radar Scanner Animation */}
          <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
            {/* Outer pulsing ring */}
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping"></div>
            {/* Middle decorative ring */}
            <div className="absolute inset-2 border-2 border-dashed border-emerald-500/30 rounded-full animate-spin [animation-duration:10s]"></div>
            {/* Inner rotating glowing border */}
            <div className="absolute inset-4 border border-emerald-500/20 rounded-full"></div>
            
            {/* Center icon */}
            <div className="absolute inset-6 bg-linear-to-br from-green-500 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white">
              <Sparkles className="size-8 animate-pulse" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI ATS Optimization Engine</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {analyzing ? `Analyzing Resume (${progress}%)` : "Initializing report..."}
            </p>
          </div>

          {/* Premium Progress Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-8 border border-slate-200/40 p-0.5">
            <div 
              className="h-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-300 shadow-xs"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Interactive Steps Checklist */}
          <div className="w-full space-y-4 text-left">
            {steps.map((step) => {
              const isCompleted = progress > step.threshold
              const isActive = progress <= step.threshold && (step.id === 1 || progress > steps[step.id - 2]?.threshold)
              const isPending = !isCompleted && !isActive

              return (
                <div 
                  key={step.id} 
                  className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                    isCompleted 
                      ? "bg-emerald-50/50 border-emerald-100/60 text-slate-700" 
                      : isActive 
                        ? "bg-slate-50 border-green-200 shadow-xs text-slate-900 ring-2 ring-green-500/5" 
                        : "bg-white border-slate-50/80 text-slate-300"
                  }`}
                >
                  {/* Step status icon */}
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="p-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                        <CheckCircle className="size-4.5" />
                      </div>
                    ) : isActive ? (
                      <Loader2 className="size-5 text-green-600 animate-spin" />
                    ) : (
                      <div className="size-5 rounded-full border-2 border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {step.id}
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className={`text-xs font-black tracking-wide ${isCompleted ? "text-slate-800" : isActive ? "text-green-700" : "text-slate-400"}`}>
                      {step.title}
                    </h4>
                    <p className={`text-[11px] leading-relaxed font-medium ${isCompleted ? "text-slate-500" : isActive ? "text-slate-600" : "text-slate-300"}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    )
  }

  if (!resume || !resume.atsAnalysis) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50/40">
        <div className="text-center space-y-4 max-w-sm">
          <AlertTriangle className="size-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">No ATS Data Available</h2>
          <p className="text-xs text-slate-500">We were unable to generate or retrieve the ATS score for this resume.</p>
          <button 
            onClick={() => loadData(true)}
            className="px-5 py-2 bg-green-600 text-white rounded-full text-xs font-bold shadow-md hover:bg-green-700 transition cursor-pointer"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    )
  }

  const { atsAnalysis } = resume
  const score = atsAnalysis.atsScore || 0
  const criteria = atsAnalysis.criteriaRating || {}

  // Determine score colors
  let scoreColorClass = "text-red-600"
  let scoreBgClass = "bg-red-50 border-red-200/50"
  let scoreProgressColor = "#ef4444" // red-500
  let scoreDescription = "Needs Improvement"

  if (score >= 76) {
    scoreColorClass = "text-emerald-600"
    scoreBgClass = "bg-emerald-50 border-emerald-200/50"
    scoreProgressColor = "#10b981" // emerald-500
    scoreDescription = "Good ATS Match"
  } else if (score >= 51) {
    scoreColorClass = "text-amber-600"
    scoreBgClass = "bg-amber-50 border-amber-200/50"
    scoreProgressColor = "#f59e0b" // amber-500
    scoreDescription = "Average ATS Match"
  }

  // Circular gauge calculations
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="bg-slate-50/50 min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Navigation header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-3xs cursor-pointer"
          >
            <ArrowLeft className="size-4" /> Back to Dashboard
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/app/builder/${resume._id}`)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-3xs cursor-pointer"
            >
              <Edit3 className="size-4 text-slate-500" /> Edit Resume
            </button>
            <button
              onClick={() => loadData(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition px-4 py-2 rounded-xl shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              <RefreshCw className="size-4 text-white" /> Re-analyze
            </button>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <FileText className="size-8" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{resume.title}</h1>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-0.5">ATS Audit Report</p>
            </div>
          </div>
          <div className="text-[10px] font-extrabold text-slate-400 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
            LAST SCANNED: {new Date(resume.updatedAt).toLocaleDateString()}
          </div>
        </div>

        {/* Two-Column Grid: Score + Categories & Strengths + Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Score Circle & Category Breakdown (takes 1 col) */}
          <div className="space-y-8 md:col-span-1">
            
            {/* Score Card */}
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-xs flex flex-col items-center text-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">ATS Score</h3>
              
              {/* Bulletproof SVG Circular Gauge */}
              <div className="w-44 h-44 relative flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Background Circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke={scoreProgressColor}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Central Text */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900 leading-none">{score}%</span>
                  <span className={`text-[9px] font-extrabold uppercase mt-2.5 tracking-wider px-2.5 py-1 rounded-md ${scoreBgClass} ${scoreColorClass} leading-none`}>
                    {scoreDescription}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-6 font-medium leading-relaxed px-4">
                This score represents how compatible your resume is with standard Applicant Tracking Systems. Aim for a score above 75% for optimal results.
              </p>
            </div>

            {/* Criteria Breakdown Bar Chart */}
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Breakdown</h3>
              
              <div className="space-y-4">
                {/* Formatting */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Layout & Formatting</span>
                    <span>{criteria.formatting || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${criteria.formatting || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Keyword Density */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Keyword Match Rate</span>
                    <span>{criteria.keywordDensity || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${criteria.keywordDensity || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Summary Strength */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Professional Summary</span>
                    <span>{criteria.summaryStrength || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${criteria.summaryStrength || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Verbs */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Action Verbs Impact</span>
                    <span>{criteria.actionVerbs || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                      style={{ width: `${criteria.actionVerbs || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Measurable Achievements */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Measurable Results</span>
                    <span>{criteria.measurableAchievements || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                      style={{ width: `${criteria.measurableAchievements || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Column 2 & 3: Detailed checklists & recommendations (takes 2 cols) */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Strengths / Positives Card */}
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-xs space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="size-4.5 text-emerald-600" /> Core Strengths ({atsAnalysis.positives?.length || 0})
              </h3>
              
              <div className="space-y-3">
                {atsAnalysis.positives && atsAnalysis.positives.length > 0 ? (
                  atsAnalysis.positives.map((positive, idx) => (
                    <div key={idx} className="p-4 bg-emerald-50/40 border border-emerald-100/50 rounded-2xl flex items-start gap-3">
                      <div className="mt-0.5 p-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                        <CheckCircle className="size-3.5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                        {positive}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific strengths identified yet.</p>
                )}
              </div>
            </div>

            {/* Shortcomings & Recommendations Card (Adupadu Recommendations) */}
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-xs space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="size-4.5 text-amber-600" /> Shortcomings & Recommendations ({atsAnalysis.improvements?.length || 0})
              </h3>
              
              <div className="space-y-3">
                {atsAnalysis.improvements && atsAnalysis.improvements.length > 0 ? (
                  atsAnalysis.improvements.map((improvement, idx) => (
                    <div key={idx} className="p-4 bg-amber-50/40 border border-amber-100/50 rounded-2xl flex items-start gap-3">
                      <div className="mt-0.5 p-0.5 bg-amber-100 text-amber-700 rounded-full">
                        <AlertTriangle className="size-3.5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                          {improvement}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50 font-semibold flex items-center gap-2">
                    <CheckCircle className="size-4.5" /> Amazing! No major shortcomings were found on this resume.
                  </p>
                )}
              </div>
            </div>

            {/* Suggested / Missing Keywords Card */}
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-xs space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="size-4.5 text-blue-600" /> Recommended Keywords ({atsAnalysis.suggestedKeywords?.length || 0})
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed -mt-2">
                Integrating these industry-specific terms and skills within your summaries, projects, and experiences will boost your keyword relevance score in ATS scans.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {atsAnalysis.suggestedKeywords && atsAnalysis.suggestedKeywords.length > 0 ? (
                  atsAnalysis.suggestedKeywords.map((keyword, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/60 hover:border-emerald-200 rounded-xl text-[11px] font-bold tracking-wide transition-colors cursor-default"
                    >
                      + {keyword}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No custom keyword suggestions available.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

export default AtsAnalysis
