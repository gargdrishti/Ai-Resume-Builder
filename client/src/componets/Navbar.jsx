import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/appContext'

const Navbar = () => {
  const { user, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className='shadow bg-white print:hidden'>
      <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 transition-all'>
        <Link to='/'>
          <img src="/logo.svg" alt="logo" className="h-11 w-auto" />
        </Link>
        <div className='flex items-center gap-4'>
          <p className='text-sm font-semibold text-slate-700'>Hi, {user?.name ? user.name.split(' ')[0] : 'User'}</p>
          <button onClick={handleLogout} className='px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-full transition duration-200 cursor-pointer'>
            Logout
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Navbar