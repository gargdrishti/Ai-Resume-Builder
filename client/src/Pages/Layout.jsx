import React, { useContext, useEffect } from 'react'
import { Outlet, Link, useLocation, useParams } from 'react-router-dom'
import Navbar from '../componets/Navbar'
import { AppContext } from '../context/appContext'

const Layout = () => {
  const location = useLocation()
  const { resumeId } = useParams()
  const { resumes, fetchResumes } = useContext(AppContext)

  useEffect(() => {
    if (resumes.length === 0) {
      fetchResumes()
    }
  }, [])

  const currentResume = resumes.find(r => r._id === resumeId)
  const resumeTitle = currentResume ? currentResume.title : 'Resume'
  const path = location.pathname

  // Separator SVG component
  const Separator = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M6.784 15.68 11.46 4.13h1.75L8.534 15.68z" fill="#CBD5E1"/>
    </svg>
  )

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      {/* Dynamic Breadcrumbs Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-6 print:hidden">
        <div className="flex flex-wrap justify-start items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 font-bold">
          
          {/* Home / Dashboard Link */}
          <Link to="/app" aria-label="Dashboard" className="hover:text-slate-700 transition duration-150 flex items-center shrink-0">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 7.609c.352 0 .69.122.96.343l.111.1 6.25 6.25v.001a1.5 1.5 0 0 1 .445 1.071v7.5a.89.89 0 0 1-.891.891H9.125a.89.89 0 0 1-.89-.89v-7.5l.006-.149a1.5 1.5 0 0 1 .337-.813l.1-.11 6.25-6.25c.285-.285.67-.444 1.072-.444Zm5.984 7.876L16 9.5l-5.984 5.985v6.499h11.968z" fill="#475569" stroke="#475569" strokeWidth=".094"/>
            </svg>
          </Link>

          {/* Breadcrumb items depending on route */}
          {path === '/app' || path === '/app/' ? (
            <>
              <Separator />
              <span className="text-indigo-600">Dashboard</span>
            </>
          ) : path.includes('/builder') ? (
            <>
              <Separator />
              <Link to="/app" className="hover:text-slate-700 transition">Dashboard</Link>
              <Separator />
              <span className="text-slate-400 font-semibold">Resume Builder</span>
              <Separator />
              <span className="text-indigo-600 truncate max-w-[150px] sm:max-w-[300px]" title={resumeTitle}>{resumeTitle}</span>
            </>
          ) : path.includes('/ats-analysis') ? (
            <>
              <Separator />
              <Link to="/app" className="hover:text-slate-700 transition">Dashboard</Link>
              <Separator />
              <span className="text-slate-400 font-semibold">ATS Audit</span>
              <Separator />
              <span className="text-indigo-600 truncate max-w-[150px] sm:max-w-[300px]" title={resumeTitle}>{resumeTitle}</span>
            </>
          ) : (
            <>
              <Separator />
              <span className="text-indigo-600">App</span>
            </>
          )}

        </div>
      </div>

      <Outlet />
    </div>
  )
}

export default Layout
