import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AppContext } from '../../context/appContext'

const PricingPlan = () => {
  const { user, createCheckoutSession } = useContext(AppContext)
  const navigate = useNavigate()

  const [billingCycle, setBillingCycle] = React.useState('yearly')
  const [selectedPlan, setSelectedPlan] = React.useState('pro')

  const pricing = {
    free: { 
      monthly: 0, 
      yearly: 0, 
      originalYearly: 0, 
      features: 'Create up to 3 Resumes, Standard PDF Export, Professional Layout Templates, Basic Support, No AI ATS Optimization Score.' 
    },
    pro: { 
      monthly: 10, 
      yearly: 8, 
      originalYearly: 10, 
      features: 'Create Unlimited Resumes, Full AI ATS Optimization, Weakness Analysis, Actionable Recommendations, Custom Public URLs, DOCX exports.' 
    }
  }

  const pricingData = [
    {
      title: 'Basic Plan',
      price: 0,
      features: [
        'Create up to 3 Resumes',
        'Standard PDF Export',
        'Professional Layout Templates',
        'Basic Support',
        'No AI ATS Optimization Score'
      ],
      buttonText: user ? (!user.isPremium ? 'Your Current Plan' : 'Go to Dashboard') : 'Get Started for Free',
      isFree: true
    },
    {
      title: 'Pro Plan',
      price: 10,
      mostPopular: true,
      features: [
        'Create Unlimited Resumes',
        'Full AI ATS Optimization Score',
        'Detailed Weakness & Shortcoming Analysis',
        'Actionable Recommendations to Fix Resume',
        'Custom Public URLs (Vanity URLs)',
        'Microsoft Word (.docx) Export',
        'Premium 24/7 Support'
      ],
      buttonText: user ? (user.isPremium ? 'Active Subscription' : 'Upgrade to Pro') : 'Get Pro Plan',
      isFree: false
    }
  ]

  const handlePlanClick = async (plan) => {
    if (!user) {
      toast.error("Please login to choose a plan.")
      navigate('/login')
      return
    }

    if (plan.isFree) {
      // Basic plan just goes to dashboard
      navigate('/app')
      return
    }

    // Pro plan subscription trigger
    if (user.isPremium) {
      toast.success("You are already on the Pro Plan.")
      navigate('/app')
      return
    }

    try {
      const loadingToast = toast.loading("Redirecting to Stripe Checkout...")
      const checkoutUrl = await createCheckoutSession()
      toast.dismiss(loadingToast)
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        throw new Error("Invalid checkout URL received")
      }
    } catch (err) {
      toast.dismiss()
      toast.error(err.message || "Failed to initiate Stripe payment. Please try again.")
    }
  }

  return (
    <>
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
          .pricing-poppins * {
            font-family: "Poppins", sans-serif;
          }
        `}
      </style>

      <section id="pricing" className='bg-linear-to-b from-slate-50 via-white to-emerald-50/30 flex flex-col items-center justify-center py-24 px-4 pricing-poppins border-t border-slate-100/60'>
        <div className="max-w-5xl mx-auto w-full flex flex-col items-center mb-10">
          <p className="text-center uppercase font-bold tracking-wider text-green-600 text-xs">PRICING</p>
          <h3 className="text-3xl font-black text-center text-slate-900 mt-2 tracking-tight">Our Pricing Plans</h3>
          <p className="text-sm text-slate-500 text-center mt-3 max-w-md mx-auto font-medium leading-relaxed">
            Choose the right plan to accelerate your career. Upgrade to Pro for unlimited resumes and detailed AI-powered ATS audits.
          </p>
        </div>

        <div className='bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-3xl w-full grid md:grid-cols-2 overflow-hidden border border-slate-100/80'>

          {/* Left Panel: Cover Image & Play Button */}
          <div className='relative hidden md:flex items-center justify-start bg-slate-900'>
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 size-11.5 rounded-full bg-white/40 flex items-center justify-center cursor-pointer hover:bg-white/50 transition-all'>
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.25 13.193A1.5 1.5 0 0 1 0 11.894V1.502a1.5 1.5 0 0 1 2.25-1.3l9 5.197c1 .577 1 2.02 0 2.598z" fill="#fff" />
              </svg>
            </div>
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" alt="Professional holding CV" className='w-full max-w-96 h-full object-cover opacity-90' />
          </div>

          {/* Right Panel: Content & Toggles */}
          <div className='p-6 relative text-left'>
            
            <h2 className='text-[20px] font-semibold text-neutral-800 mb-5.5'>Upgrade to Resumify Pro</h2>

            {/* Billing Cycle Toggle Buttons */}
            <div className='flex items-center gap-3 bg-neutral-100 p-1 rounded-sm mb-4'>
              <button 
                onClick={() => setBillingCycle('monthly')} 
                className={`flex-1 py-2.5 rounded-sm transition-all text-xs font-bold cursor-pointer ${
                  billingCycle === 'monthly' 
                    ? 'bg-white text-neutral-800 shadow-sm' 
                    : 'bg-transparent text-gray-500 hover:text-neutral-700' 
                }`} 
              >
                Monthly
              </button>

              <button 
                onClick={() => setBillingCycle('yearly')} 
                className={`flex-1 py-2.5 rounded-sm font-bold transition-all relative text-xs cursor-pointer ${
                  billingCycle === 'yearly' 
                    ? 'bg-white text-neutral-800 shadow-sm' 
                    : 'bg-transparent text-gray-500 hover:text-neutral-700' 
                }`} 
              >
                Yearly
                <span className='ml-2 bg-neutral-800 text-white text-[9px] px-2 py-0.5 rounded-full font-medium'>20% off</span>
              </button>
            </div>

            {/* Plans List */}
            <div className='space-y-4 mb-4 max-w-full'>

              {/* Free Plan Card */}
              <div 
                onClick={() => setSelectedPlan('free')} 
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPlan === 'free' 
                    ? 'border-green-600 bg-green-50/30' 
                    : 'border-gray-200 hover:border-gray-300' 
                }`}
              >
                <div className='flex items-start gap-3'>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 shrink-0 ${
                    selectedPlan === 'free' ? 'border-green-600 bg-green-600' : 'border-gray-300'
                  }`}>
                    {selectedPlan === 'free' && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div className='flex-1'>
                    <div className='flex items-center justify-between mb-2 flex-wrap gap-1'>
                      <h3 className='text-sm font-bold text-neutral-800'>Basic Plan</h3>
                      <div className='flex items-center gap-1'>
                        <span className='text-[18px] font-bold text-neutral-800'>$0</span>
                        <span className='text-neutral-400 text-[10px] font-medium'>/mo</span>
                      </div>
                    </div>
                    <p className='text-[11px] text-slate-500 font-semibold leading-relaxed'>{pricing.free.features}</p>
                  </div>
                </div>
              </div>

              {/* Pro Plan Card */}
              <div 
                onClick={() => setSelectedPlan('pro')} 
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPlan === 'pro' 
                    ? 'border-green-600 bg-green-50/30' 
                    : 'border-gray-200 hover:border-gray-300' 
                }`}
              >
                <div className='flex items-start gap-3'>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 shrink-0 ${
                    selectedPlan === 'pro' ? 'border-green-600 bg-green-600' : 'border-gray-300'
                  }`}>
                    {selectedPlan === 'pro' && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div className='flex-1'>
                    <div className='flex items-center justify-between mb-2 flex-wrap gap-1'>
                      <h3 className='text-sm font-bold text-neutral-800'>Pro Plan</h3>
                      <div className='flex items-center gap-1.5'>
                        {billingCycle === 'yearly' && (
                          <span className='text-neutral-400 line-through text-xs font-semibold'>${pricing.pro.originalYearly}</span>
                        )}
                        <span className='text-[18px] font-bold text-neutral-800'>
                          ${billingCycle === 'monthly' ? pricing.pro.monthly : pricing.pro.yearly}
                        </span>
                        <span className='text-neutral-400 text-[10px] font-medium'>
                          {billingCycle === 'monthly' ? '/mo' : '/mo, billed yearly'}
                        </span>
                      </div>
                    </div>
                    <p className='text-[11px] text-slate-500 font-semibold leading-relaxed'>{pricing.pro.features}</p>
                  </div>
                </div>
              </div>

            </div>

            <button 
              onClick={() => toast.success("Free: Max 3 resumes. Pro: Unlimited creation, full AI ATS optimization, vanity URLs, and DOCX exports.")} 
              className='text-neutral-800 text-xs mb-5 hover:text-neutral-900 transition-colors flex items-center gap-1 cursor-pointer font-bold'
            >
              Compare plans
              <svg width="7" height="11" viewBox="0 0 7 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m.75 9.75 5-4.5-5-4.5" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Action buttons */}
            <button 
              onClick={() => handlePlanClick(selectedPlan === 'pro' ? pricingData[1] : pricingData[0])}
              className='w-full bg-neutral-950 text-white text-xs py-3.5 rounded-xl font-bold hover:bg-neutral-800 active:scale-98 transition-all mb-4 cursor-pointer shadow-md shadow-neutral-950/10'
            >
              {selectedPlan === 'pro' ? 'Get Pro Plan Now' : 'Get Started for Free'}
            </button>

            <button 
              onClick={() => navigate('/app')}
              className='w-full text-neutral-500 text-xs hover:text-neutral-700 transition-colors cursor-pointer font-bold block text-center'
            >
              Continue with free plan
            </button>

          </div>
        </div>
      </section>
    </>
  )
}

export default PricingPlan
