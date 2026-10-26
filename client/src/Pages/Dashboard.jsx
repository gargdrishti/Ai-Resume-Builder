import { Plus, UploadCloud, FileText, Trash2, Pencil, X as XIcon, Search, Calendar, Award, CheckCircle, Sparkles } from 'lucide-react'
import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AppContext } from '../context/appContext'
import OnboardingTour from '../componets/OnboardingTour'

const Dashboard = () => {
  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"]
  const { 
    resumes, 
    fetchResumes, 
    createResume, 
    deleteResume: contextDeleteResume, 
    uploadResume: contextUploadResume, 
    user,
    createCheckoutSession,
    verifyCheckoutSession
  } = useContext(AppContext)

  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [title, setTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [resume, setResume] = useState(null)
  const [editResumeId, setEditResumeId] = useState('')
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const navigate = useNavigate()
  const allResumes = resumes

  useEffect(() => {
    fetchResumes()
  }, [])

  // Stripe checkout redirect verification handler
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const paymentStatus = queryParams.get('payment')
    const sessionId = queryParams.get('session_id')

    if (paymentStatus === 'success' && sessionId) {
      const verify = async () => {
        const loadingToast = toast.loading("Verifying your subscription with Stripe...")
        try {
          await verifyCheckoutSession(sessionId)
          toast.dismiss(loadingToast)
          toast.success("Upgrade Successful! Welcome to Resumify Pro!", {
            icon: '🎉',
            duration: 6000
          })
          navigate('/app', { replace: true })
        } catch (err) {
          toast.dismiss(loadingToast)
          toast.error(err.message || "Failed to verify payment session.")
          navigate('/app', { replace: true })
        }
      }
      verify()
    } else if (paymentStatus === 'cancel') {
      toast.error("Stripe payment cancelled.")
      navigate('/app', { replace: true })
    }
  }, [])

  // Debug log effects to satisfy ESLint no-unused-vars rule
  useEffect(() => {
    if (resume) {
      console.log('Active resume selected:', resume.title)
    }
  }, [resume])

  useEffect(() => {
    if (editResumeId) {
      console.log('Editing resume ID set:', editResumeId)
    }
  }, [editResumeId])

  const deleteResume = async (resumeId) => {
    const confirm = window.confirm('Are you sure you want to delete this resume?')
    if(confirm){
      try {
        await contextDeleteResume(resumeId)
        toast.success("Resume deleted successfully.")
      } catch (err) {
        toast.error(err.message || "Failed to delete resume.")
      }
    }
  }

  const handleCreateResume = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    // Free tier resume count guard
    if (user && !user.isPremium && allResumes.length >= 3) {
      toast.error("Free tier limit reached. You can only create up to 3 resumes. Please upgrade to Pro.", {
        icon: '🔒',
        duration: 5000
      })
      setShowCreateResume(false)
      return
    }

    setCreating(true)

    try {
      const newResume = await createResume(title.trim())
      setShowCreateResume(false)
      setTitle("")
      toast.success(`"${title}" created successfully!`)
      navigate(`/app/builder/${newResume._id}`)
    } catch (err) {
      toast.error(err.message || "Failed to create resume.")
    } finally {
      setCreating(false)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      // Automatically set the title to the file name (without extension) if not already set
      if (!title.trim()) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "")
        setTitle(nameWithoutExtension)
      }
    }
  }

  const extractTextFromPdf = async (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        try {
          const typedarray = new Uint8Array(this.result);
          if (!window.pdfjsLib) {
            await new Promise((res, rej) => {
              const script = document.createElement('script');
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
              script.onload = res;
              script.onerror = rej;
              document.head.appendChild(script);
            });
          }
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
          const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }
          resolve(fullText);
        } catch (err) {
          reject(err);
        }
      };
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromTxtOrJson = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleUploadResume = async (e) => {
    e.preventDefault()
    if (!title.trim() || !selectedFile) {
      toast.error("Please select a file and enter a title.")
      return
    }

    // Free tier resume count guard
    if (user && !user.isPremium && allResumes.length >= 3) {
      toast.error("Free tier limit reached. You can only upload up to 3 resumes. Please upgrade to Pro.", {
        icon: '🔒',
        duration: 5000
      })
      setShowUploadResume(false)
      setSelectedFile(null)
      setTitle('')
      return
    }

    setUploading(true)
    const toastId = toast.loading("Scraping and parsing resume with AI...")
    try {
      let text = '';
      if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
        text = await extractTextFromPdf(selectedFile);
      } else if (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json') || selectedFile.name.endsWith('.txt')) {
        text = await extractTextFromTxtOrJson(selectedFile);
      } else {
        throw new Error('Unsupported file format. Please upload a PDF, TXT, or JSON file.');
      }

      const parsedId = await contextUploadResume(text, title.trim())
      toast.success(`"${title}" uploaded and parsed successfully!`, { id: toastId })
      setShowUploadResume(false)
      setSelectedFile(null)
      setTitle("")
      navigate(`/app/builder/${parsedId}`)
    } catch (err) {
      toast.error(err.message || "Failed to upload and parse resume.", { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const getAtsBadgeStyles = (score) => {
    if (score <= 40) {
      return {
        badge: "bg-red-50 text-red-700 border-red-200/60 hover:bg-red-100/70 hover:border-red-300",
        iconColor: "text-red-500",
        label: "Needs Improvement"
      }
    }
    if (score <= 70) {
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100/70 hover:border-amber-300",
        iconColor: "text-amber-500",
        label: "Good"
      }
    }
    return {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/70 hover:border-emerald-300",
      iconColor: "text-emerald-600",
      label: "Excellent"
    }
  }

  const getSortedResumes = (resumesList) => {
    const listCopy = [...resumesList]
    if (sortBy === 'newest') {
      return listCopy.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    }
    if (sortBy === 'oldest') {
      return listCopy.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
    }
    if (sortBy === 'ats') {
      return listCopy.sort((a, b) => {
        const scoreA = a.atsAnalysis?.atsScore ?? -1
        const scoreB = b.atsAnalysis?.atsScore ?? -1
        return scoreB - scoreA
      })
    }
    return listCopy
  }
  
  const filteredResumes = allResumes.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const sortedAndFilteredResumes = getSortedResumes(filteredResumes)

  const tourSteps = [
    {
      target: '#create-new-btn',
      title: 'Create Resume from Scratch',
      content: 'Click here to design your professional resume from scratch by filling out our easy step-by-step CV forms.',
      position: 'bottom'
    },
    {
      target: '#upload-existing-btn',
      title: 'Upload and AI Parse CV',
      content: 'Upload your existing PDF, JSON, or TXT CV. Our intelligent AI will scan, extract, and pre-fill your resume template automatically.',
      position: 'bottom'
    },
    {
      target: '#search-sort-container',
      title: 'Filter & Sort Resumes',
      content: 'Quickly find specific CVs using the search bar, or sort them by date updated or highest ATS compatibility score.',
      position: 'bottom'
    },
    {
      target: '#first-resume-card',
      title: 'Manage Your Resumes',
      content: 'Each card displays your resume\'s basic details and updated date. Click anywhere on the card to open it in the editor.',
      position: 'bottom'
    },
    {
      target: '#first-resume-actions',
      title: 'ATS Audit, Edit & Delete',
      content: 'Hover over a card to access quick controls: click Sparkles (✨) to run a premium AI ATS optimization audit, Pencil (✏️) to edit details, or Trash (🗑️) to delete.',
      position: 'bottom'
    }
  ]

  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good morning'
    if (hr < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date().toLocaleDateString('en-US', options)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `Updated on ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <OnboardingTour steps={tourSteps} tourKey="dashboard" />
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Dashboard Welcome & Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              {getGreeting()}, <span className="bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{user ? user.name.split(' ')[0] : 'User'}</span>! ⚡
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 font-medium">
              Create, edit, and optimize your professional resumes with AI-powered suggestions.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 shadow-2xs">
            <Calendar className="size-4.5 text-green-600" />
            <span className="text-xs font-semibold text-slate-600 tracking-wide">
              {getCurrentDate()}
            </span>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <FileText className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Resumes</p>
              <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">{allResumes.length}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Award className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Optimizer</p>
              <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">Active & Ready</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between grow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${user?.isPremium ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                {user?.isPremium ? <Award className="size-6" /> : <CheckCircle className="size-6" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Status</p>
                <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
                  {user?.isPremium ? 'Premium Pro' : 'Free Tier'}
                </h3>
              </div>
            </div>
            {!user?.isPremium && (
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
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="size-3.5 text-white animate-pulse" />
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Actions & Search Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          
          {/* Search & Sorting Container */}
          <div id="search-sort-container" className="flex flex-col sm:flex-row gap-3.5 w-full md:w-auto md:grow md:max-w-2xl">
            {/* Live Search */}
            <div className="relative grow sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resumes by title..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 text-slate-800 placeholder-slate-400 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 transition"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Sort:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 cursor-pointer transition-all hover:bg-slate-100/60"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="ats">Highest ATS Score</option>
              </select>
            </div>
          </div>

          {/* Create / Upload Quick Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              id="create-new-btn"
              onClick={() => setShowCreateResume(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 h-11 bg-green-600 hover:bg-green-700 hover:scale-102 active:scale-98 text-white font-semibold text-sm rounded-full shadow-lg shadow-green-600/15 transition-all cursor-pointer"
            >
              <Plus className="size-4.5" />
              Create New
            </button>
            <button 
              id="upload-existing-btn"
              onClick={() => setShowUploadResume(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 h-11 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 hover:scale-102 active:scale-98 text-white font-semibold text-sm rounded-full shadow-lg shadow-indigo-600/15 border-0 transition-all cursor-pointer"
            >
              <UploadCloud className="size-4.5 text-white" />
              Upload Existing
            </button>
          </div>

        </div>

        {/* Resumes Grid */}
        <div>
          {allResumes.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-xl mx-auto mt-10">
              {/* Premium Inline SVG Illustration */}
              <div className="relative mb-6 flex items-center justify-center w-48 h-36">
                {/* Decorative background glow blobs */}
                <div className="absolute -inset-2 bg-linear-to-tr from-green-500/10 to-indigo-500/10 rounded-full blur-2xl opacity-70 animate-pulse"></div>
                
                <svg className="w-full h-full relative" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Floating geometric particles */}
                  <circle cx="25" cy="35" r="4" className="fill-indigo-500/20 animate-bounce" style={{ animationDuration: '3s' }} />
                  <circle cx="175" cy="45" r="5" className="fill-green-500/20 animate-bounce" style={{ animationDuration: '4s' }} />
                  <path d="M160 110 L165 115 L170 110" stroke="#10B981" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                  
                  {/* Sparkles */}
                  <path d="M150 25 L152 30 L157 32 L152 34 L150 39 L148 34 L143 32 L148 30 Z" className="fill-amber-400 animate-pulse" />
                  <path d="M40 100 L41.5 103.5 L45 105 L41.5 106.5 L40 110 L38.5 106.5 L35 105 L38.5 103.5 Z" className="fill-green-400 animate-pulse" style={{ animationDelay: '0.5s' }} />

                  {/* Folder Back */}
                  <path d="M30 60 C30 54.4772 34.4772 50 40 50 H75 L90 62 H160 C165.523 62 170 66.4772 170 72 V120 C170 125.523 165.523 130 160 130 H40 C34.4772 130 30 125.523 30 120 V60 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
                  
                  {/* Glowing documents inside folder */}
                  <rect x="50" y="40" width="80" height="70" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="2" transform="rotate(-6 90 75)" />
                  <line x1="60" y1="52" x2="110" y2="47" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" transform="rotate(-6 90 75)" />
                  <line x1="60" y1="64" x2="100" y2="60" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" transform="rotate(-6 90 75)" />
                  <line x1="60" y1="76" x2="85" y2="73" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" transform="rotate(-6 90 75)" />

                  <rect x="65" y="45" width="80" height="70" rx="6" fill="white" stroke="#CBD5E1" strokeWidth="2" transform="rotate(3 105 80)" />
                  <line x1="75" y1="58" x2="125" y2="61" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" transform="rotate(3 105 80)" />
                  <line x1="75" y1="70" x2="115" y2="72" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" transform="rotate(3 105 80)" />
                  <line x1="75" y1="82" x2="105" y2="83" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" transform="rotate(3 105 80)" />
                  
                  {/* Folder Front Flap */}
                  <path d="M30 75 C30 71.6863 32.6863 69 36 69 H164 C167.314 69 170 71.6863 170 75 V120 C170 125.523 165.523 130 160 130 H40 C34.4772 130 30 125.523 30 120 V75 Z" fill="#FFFFFF" fillOpacity="0.8" stroke="#E2E8F0" strokeWidth="2" />
                  
                  {/* Add badge symbol in front */}
                  <circle cx="100" cy="100" r="16" fill="#10B981" className="animate-pulse" />
                  <path d="M96 100 H104 M100 96 V104" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                Start your journey by creating your first resume
              </h3>
              <p className="text-slate-500 text-xs font-semibold mt-2.5 max-w-sm leading-relaxed">
                Build a premium, recruiter-approved resume in minutes using our advanced AI-assisted builder or upload an existing file to optimize it instantly.
              </p>
              
              {/* Primary Action buttons for empty state */}
              <div className="flex flex-wrap gap-3.5 mt-8 justify-center w-full max-w-xs">
                <button 
                  onClick={() => setShowCreateResume(true)}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-5 h-11 bg-green-600 hover:bg-green-700 hover:scale-102 active:scale-98 text-white font-bold text-xs rounded-full shadow-lg shadow-green-600/15 transition-all cursor-pointer"
                >
                  <Plus className="size-4" />
                  Create New
                </button>
                <button 
                  onClick={() => setShowUploadResume(true)}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-5 h-11 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 hover:scale-102 active:scale-98 text-white font-bold text-xs rounded-full shadow-lg shadow-indigo-600/15 border-0 transition-all cursor-pointer"
                >
                  <UploadCloud className="size-4" />
                  Upload Existing
                </button>
              </div>
            </div>
          ) : sortedAndFilteredResumes.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-xl mx-auto mt-10">
              <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mb-5 text-slate-400 border border-slate-100">
                <FileText className="size-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                No matching resumes found
              </h3>
              <p className="text-slate-500 text-sm mt-2 max-w-sm leading-relaxed">
                We couldn't find any resumes matching your search query. Try checking for typos or searching for a different title.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              
              {/* Quick Create Card Tile inside grid */}
              <button 
                onClick={() => setShowCreateResume(true)}
                className="bg-white border-2 border-dashed border-slate-200 hover:border-solid hover:border-green-500 hover:shadow-[0_10px_25px_-5px_rgba(22,163,74,0.12)] rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3.5 aspect-5/6 group transition-all duration-300 cursor-pointer"
              >
                <div className="p-4 bg-green-50 text-green-600 rounded-full group-hover:scale-110 group-hover:bg-green-100 transition duration-300 shadow-2xs">
                  <Plus className="size-8 stroke-[2.5]" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-black text-slate-800 group-hover:text-green-600 transition">
                    Create New Resume
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold group-hover:text-slate-500 transition leading-tight">
                    Click to start from scratch
                  </span>
                </div>
              </button>

              {/* Dynamic Resume Cards */}
              {sortedAndFilteredResumes.map((resumeItem, index) => {
                const cardColor = colors[index % colors.length]
                return (
                  <div
                    key={resumeItem._id}
                    id={index === 0 ? "first-resume-card" : undefined}
                    onClick={() => navigate(`/app/builder/${resumeItem._id}`)}
                    className="bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl p-5 flex flex-col items-center justify-between aspect-5/6 relative group transition-all duration-300 cursor-pointer hover:-translate-y-1.5 hover:shadow-xl"
                  >
                    {/* Floating Hover Controls */}
                    <div 
                      id={index === 0 ? "first-resume-actions" : undefined}
                      className={`absolute top-3.5 right-3.5 flex gap-1.5 transition-all duration-200 z-10 ${index === 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (user && !user.isPremium) {
                            toast.error("AI ATS Optimization Score is a Pro feature. Please upgrade to Pro to unlock.", {
                              icon: '🔒',
                              duration: 5000
                            })
                            return
                          }
                          navigate(`/app/ats-analysis/${resumeItem._id}`)
                        }}
                        className="p-1.5 bg-white border border-slate-100 text-slate-500 hover:text-green-600 hover:scale-105 rounded-lg shadow-md transition cursor-pointer"
                        title="ATS Score & Recommendations"
                      >
                        <Sparkles className="size-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/app/builder/${resumeItem._id}`)
                        }}
                        className="p-1.5 bg-white border border-slate-100 text-slate-500 hover:text-slate-800 hover:scale-105 rounded-lg shadow-md transition cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteResume(resumeItem._id)
                        }}
                        className="p-1.5 bg-white border border-slate-100 text-slate-500 hover:text-red-600 hover:scale-105 rounded-lg shadow-md transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {/* Central Area: Premium Styled Icon Wrapper */}
                    <div className="flex flex-col items-center justify-center grow py-4">
                      <div 
                        style={{ backgroundColor: cardColor + '12', color: cardColor }}
                        className="p-4 rounded-2xl mb-3.5 transition-transform duration-300 group-hover:scale-110 shadow-2xs"
                      >
                        <FileText className="size-7" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-800 text-center px-2 truncate w-32">
                        {resumeItem.title}
                      </h3>
                    </div>

                    {/* Footer: Date & Status */}
                    <div className="w-full border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] font-bold">
                      {resumeItem.atsAnalysis && user?.isPremium ? (
                        (() => {
                          const badgeStyles = getAtsBadgeStyles(resumeItem.atsAnalysis.atsScore)
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/app/ats-analysis/${resumeItem._id}`)
                              }}
                              className={`px-2 py-0.5 border rounded-md transition-all cursor-pointer flex items-center gap-1 font-extrabold text-[9px] ${badgeStyles.badge}`}
                              title={`ATS Quality: ${badgeStyles.label}`}
                            >
                              <Sparkles className={`size-2.5 animate-pulse ${badgeStyles.iconColor}`} />
                              <span>ATS: {resumeItem.atsAnalysis.atsScore}%</span>
                            </button>
                          )
                        })()
                      ) : (
                        (() => {
                          const score = resumeItem.atsAnalysis?.atsScore
                          const badgeStyles = score ? getAtsBadgeStyles(score) : null
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (user && !user.isPremium) {
                                  toast.error("AI ATS Optimization Score is a Pro feature. Please upgrade to Pro to unlock.", {
                                    icon: '🔒',
                                    duration: 5000
                                  })
                                  return
                                }
                                navigate(`/app/ats-analysis/${resumeItem._id}`)
                              }}
                              className={`px-2 py-0.5 border rounded-md transition-all cursor-pointer flex items-center gap-1 font-extrabold text-[9px] ${
                                badgeStyles 
                                  ? `${badgeStyles.badge} border-dashed` 
                                  : 'bg-slate-50 text-slate-500 border-slate-200/60 hover:bg-green-50 hover:text-green-700 hover:border-green-200/60'
                              }`}
                              title={score ? `ATS Quality: ${badgeStyles.label} (Upgrade to Pro to unlock full audit)` : "Upgrade to Pro to unlock ATS score"}
                            >
                              <span>{resumeItem.atsAnalysis ? `ATS: ${resumeItem.atsAnalysis.atsScore}% 🔒` : 'Score ATS 🔒'}</span>
                            </button>
                          )
                        })()
                      )}
                      <span className="text-[9px] tracking-wide text-slate-400 font-bold">
                        {formatDate(resumeItem.updatedAt).replace('Updated on ', '')}
                      </span>
                    </div>

                  </div>
                )
              })}

            </div>
          )}
        </div>

      </div>

      {/* Conditional Create Resume Modal */}
      {showCreateResume && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => !creating && setShowCreateResume(false)}
        >
          <form 
            onSubmit={handleCreateResume}
            className="bg-white border border-slate-100 p-7 rounded-3xl shadow-2xl max-w-sm w-full relative transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-extrabold text-slate-900 mb-2">Create New Resume</h2>
            <p className="text-xs text-slate-400 font-medium mb-5">Give your resume a name to start building.</p>
            
            <input 
              type="text" 
              placeholder="e.g. Software Engineer CV" 
              className="w-full px-4 py-2.5 mb-5 border border-slate-200 rounded-full focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 text-sm placeholder-slate-400 text-slate-800 transition-all disabled:bg-slate-50 disabled:text-slate-400" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={creating}
              required 
            />
            
            <button 
              type="submit" 
              disabled={creating}
              className="w-full py-3 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-full font-bold text-sm transition shadow-lg shadow-green-600/20 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {creating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Creating...</span>
                </>
              ) : (
                "Create Resume"
              )}
            </button>
            
            <button 
              type="button"
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50" 
              onClick={() => setShowCreateResume(false)} 
              disabled={creating}
            >
              <XIcon className="size-5" />
            </button>
          </form>
        </div>
      )}

      {/* Conditional Upload Resume Modal */}
      {showUploadResume && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => { if (!uploading) { setShowUploadResume(false); setSelectedFile(null); setTitle(''); } }}
        >
          <form 
            onSubmit={handleUploadResume}
            className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full relative transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-extrabold text-slate-900 mb-2">Upload Existing Resume</h2>
            <p className="text-xs text-slate-400 font-medium mb-4">Our AI will automatically scrape and parse your data.</p>
            
            <input 
              type="text" 
              placeholder="Resume Title" 
              className="w-full px-4 py-2.5 mb-4 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 text-sm placeholder-slate-400 text-slate-800 transition-all disabled:bg-slate-50 disabled:text-slate-400" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              required 
            />

            <p className="text-xs font-bold text-slate-500 text-left mb-2 pl-1 uppercase tracking-wide">Select Document</p>
            
            <div 
              onClick={() => !uploading && document.getElementById('resume-file').click()}
              className={`w-full border border-dashed rounded-2xl py-8 flex flex-col items-center justify-center gap-2 transition-all mb-5 ${
                uploading 
                  ? 'border-green-355 border-green-300 bg-green-50/20 cursor-not-allowed' 
                  : 'border-slate-300 hover:border-green-500 hover:bg-slate-50/50 cursor-pointer'
              }`}
            >
              {uploading ? (
                <div className="relative flex size-10 items-center justify-center mb-1">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75 animate-ping duration-1000"></span>
                  <UploadCloud className="size-9 text-green-600 relative animate-pulse" />
                </div>
              ) : (
                <UploadCloud className="size-9 text-slate-400" />
              )}
              <span className={`text-xs font-bold text-center px-4 truncate w-full ${uploading ? 'text-green-700' : 'text-slate-500'}`}>
                {uploading 
                  ? 'AI is reading and parsing document...' 
                  : selectedFile ? selectedFile.name : 'Upload PDF, TXT, or JSON'}
              </span>
            </div>

            <input 
              type="file" 
              id="resume-file" 
              className="hidden" 
              accept=".pdf,.json,.doc,.docx,.txt" 
              onChange={handleFileChange} 
              disabled={uploading}
              required 
            />
            
            <button 
              type="submit" 
              disabled={uploading}
              className="w-full py-3 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-full font-bold text-sm transition shadow-lg shadow-green-600/20 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>AI Parsing...</span>
                </>
              ) : (
                "Upload & Parse"
              )}
            </button>
            
            <button 
              type="button"
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50" 
              onClick={() => { setShowUploadResume(false); setSelectedFile(null); setTitle(''); }} 
              disabled={uploading}
            >
              <XIcon className="size-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Dashboard
