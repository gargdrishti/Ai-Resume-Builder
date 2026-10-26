import React from 'react'
import Banner from '../componets/Home/Banner'
import Navbar from '../componets/Home/Navbar'
import Hero from '../componets/Home/Hero'
import Fearure from '../componets/Home/Fearure'
import Testimonials from '../componets/Home/Testimonials'
import PricingPlan from '../componets/Home/PricingPlan'
import Cta from '../componets/Home/Cta'
import Footer from '../componets/Home/Footer'

const Home = () => {
  return (
    <div className="flex flex-col bg-white">
      <Banner />
      <Navbar />
      <Hero />
      <Fearure />
      <Testimonials />
      <PricingPlan />
      <div className="px-6 md:px-12 py-16">
        <Cta />
      </div>
      <Footer/>
    </div>
  )
}

export default Home
