import React from 'react'
import { Link } from 'react-router-dom'

const Cta = () => {
  return (
    <section id="cta" className="flex flex-col items-center justify-center mx-auto max-md:mx-2 max-md:px-4 max-w-5xl w-full text-center rounded-2xl py-20 md:py-24 bg-[linear-gradient(to_bottom_right,rgba(6,78,59,0.85),rgba(15,23,42,0.95)),url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/banners/image-1.png')] bg-cover bg-center bg-no-repeat shadow-xl shadow-green-900/5">
      <h2 className="text-3xl md:text-4xl font-bold text-white max-w-2xl tracking-tight leading-tight px-4">
        Build Your Professional AI-Powered Resume in Minutes
      </h2>
      <div className="h-[3px] w-32 my-4 bg-linear-to-r from-transparent via-green-400 to-transparent"></div>
      <p className="text-sm md:text-base text-slate-200 max-w-xl leading-relaxed px-4">
        Leverage our next-generation AI builder to write, format, and optimize your resume for recruiters in just a few clicks.
      </p>
      <Link to="/login" className="px-8 py-3 mt-6 text-sm font-medium bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 active:scale-95 transition-all duration-300 text-white rounded-full shadow-lg shadow-green-900/30 cursor-pointer">
        Get Started
      </Link>
    </section>
  )
}

export default Cta