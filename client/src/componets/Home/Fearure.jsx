import React from 'react'
import Title from './Title'

const Fearure = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const features = [
    {
      title: "AI ATS Analysis",
      description: "Audit and optimize your resume against Applicant Tracking Systems to maximize call-backs.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-violet-600">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
          <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z" opacity="0.5" />
          <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" opacity="0.5" />
        </svg>
      ),
      activeBg: "bg-violet-50/80",
      activeBorder: "border-violet-200",
      hoverBg: "hover:bg-violet-50/30",
    },
    {
      title: "Interactive Builder",
      description: "Build your resume section-by-section with live preview, custom templates, and color pickers.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-green-600">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      ),
      activeBg: "bg-green-50/80",
      activeBorder: "border-green-200",
      hoverBg: "hover:bg-green-50/30",
    },
    {
      title: "Multi-Format Exports",
      description: "Download your completed resume in recruiter-approved PDF format or Microsoft Word (.docx).",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-orange-600">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
      ),
      activeBg: "bg-orange-50/80",
      activeBorder: "border-orange-200",
      hoverBg: "hover:bg-orange-50/30",
    }
  ];

  return (
    <section id="features" className="pt-12 pb-20 bg-white relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute bottom-20 -right-20 -z-10 size-96 bg-green-100/30 blur-[130px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Badge */}
        <div className="flex justify-center mb-5">
          <div className="flex items-center gap-2 text-sm text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] rounded-full px-4 py-1 w-fit shadow-sm">
            <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1.613 8.2a.62.62 0 0 1-.553-.341.59.59 0 0 1 .076-.637l6.048-6.118a.31.31 0 0 1 .375-.069c.061.033.11.084.137.147a.3.3 0 0 1 .014.197L6.537 4.991a.59.59 0 0 0 .07.552.61.61 0 0 0 .504.257h4.276a.62.62 0 0 1 .553.341.59.59 0 0 1-.076.637l-6.048 6.119a.31.31 0 0 1-.375.067.295.295 0 0 1-.15-.344l1.172-3.61a.59.59 0 0 0-.07-.553.61.61 0 0 0-.504-.257z"
                stroke="#047857" strokeMiterlimit="5.759" strokeLinecap="round" />
            </svg>
            <span className="font-semibold">Responded to 99% applicants</span>
          </div>
        </div>

        <Title 
          title="Build your resume" 
          description="Our streamlined process helps you create a professional resume in minutes with intelligent AI-powered tools and features." 
        />

        {/* Two-Column Grid */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          
          {/* Left Column: Overlapping Group Image */}
          <div className="w-full lg:w-[55%] max-w-2xl flex justify-center">
            <img 
              className="w-full h-auto object-contain xl:-ml-12 drop-shadow-xl" 
              src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/group-image-1.png" 
              alt="Build your resume process illustration" 
            />
          </div>

          {/* Right Column: Interactive Features List */}
          <div className="w-full lg:w-[45%] flex flex-col gap-4 max-w-md">
            {features.map((feature, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`p-6 border rounded-xl flex gap-4 transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? `${feature.activeBg} ${feature.activeBorder} shadow-sm translate-x-1` 
                      : `bg-transparent border-transparent ${feature.hoverBg}`
                  }`}
                >
                  <div className="mt-1 shrink-0">
                    {feature.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-800">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  )
}

export default Fearure