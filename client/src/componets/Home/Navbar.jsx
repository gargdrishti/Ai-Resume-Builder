import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/appContext'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { user, logout } = useContext(AppContext);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-40 text-sm bg-white/80 backdrop-blur-md border-b border-slate-100/80 transition-all duration-300">
      <a href="#" className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="size-7" fill="none">
          <path d="M 46,46 Q 34,12 12,12 Q 12,34 46,46 Z" fill="#f43f5e" />
          <path d="M 54,46 Q 66,12 88,12 Q 88,34 54,46 Z" fill="#eab308" />
          <path d="M 46,54 Q 34,88 12,88 Q 12,66 46,54 Z" fill="#10b981" />
          <path d="M 54,54 Q 66,88 88,88 Q 88,66 54,54 Z" fill="#a855f7" />
        </svg>
        <span>Resumi<span className="text-green-550 text-green-500">fy</span></span>
      </a>

      <div className="hidden md:flex items-center gap-8 transition duration-500 text-slate-800 font-medium">
        <a href="#" className="hover:text-green-600 transition">Home</a>
        <a href="#features" className="hover:text-green-600 transition">Features</a>
        <a href="#testimonials" className="hover:text-green-600 transition">Testimonials</a>
        <a href="#cta" className="hover:text-green-600 transition">Contact</a>
      </div>

      <div className="flex gap-2">
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/app" className="hidden md:block px-5 py-2 border border-green-500 hover:bg-green-50 text-green-700 font-medium rounded-full active:scale-95 transition-all cursor-pointer">
              Dashboard
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 transition rounded-full cursor-pointer">
                <div className="size-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold uppercase text-sm shadow-sm shadow-green-200">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline text-slate-800 font-semibold text-sm max-w-28 truncate">
                  Hi, {user?.name?.split(' ')[0]}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 size-4 group-hover:rotate-180 transition-transform duration-200"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-100">
                <div className="px-4 py-2 border-b border-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  User Account
                </div>
                <Link to="/app" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-slate-500"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                  <span>My Dashboard</span>
                </Link>
                <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50/50 transition text-left cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Link to="/login" className="hidden md:block px-6 py-2 bg-green-500 hover:bg-green-600 active:scale-95 transition-all rounded-full text-white font-medium cursor-pointer">
              Get started
            </Link>
            <Link to="/login" className="hidden md:block px-6 py-2 border active:scale-95 hover:bg-slate-50 transition-all rounded-full text-slate-700 hover:text-slate-900 font-medium cursor-pointer" >
              Login
            </Link>
          </>
        )}
      </div>

      <button onClick={() => setMenuOpen(true)} className="md:hidden active:scale-90 transition cursor-pointer" >
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-menu" >
          <path d="M4 5h16M4 12h16M4 19h16" />
        </svg>
      </button>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-100 bg-black/40 text-black backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`} >
        <a href="#" onClick={() => setMenuOpen(false)} className="text-white hover:text-green-400 transition">Home</a>
        <a href="#features" onClick={() => setMenuOpen(false)} className="text-white hover:text-green-400 transition">Features</a>
        <a href="#testimonials" onClick={() => setMenuOpen(false)} className="text-white hover:text-green-400 transition">Testimonials</a>
        <a href="#cta" onClick={() => setMenuOpen(false)} className="text-white hover:text-green-400 transition">Contact</a>
        {user ? (
          <>
            <Link to="/app" onClick={() => setMenuOpen(false)} className="text-white hover:text-green-400 transition">
              My Dashboard
            </Link>
            <button onClick={() => { logout(); setMenuOpen(false); }} className="text-rose-400 hover:text-rose-500 transition font-medium cursor-pointer">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" onClick={() => setMenuOpen(false)} className="px-8 py-3 bg-green-500 text-white rounded-full font-semibold transition-all">
            Get Started
          </Link>
        )}
        <button onClick={() => setMenuOpen(false)} className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-green-600 hover:bg-green-700 transition text-white rounded-md flex cursor-pointer" >
          X
        </button>
      </div>
    </nav>
  )
}

export default Navbar
