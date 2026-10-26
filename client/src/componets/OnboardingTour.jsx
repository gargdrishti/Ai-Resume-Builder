import React, { useState, useEffect } from 'react';

const OnboardingTour = ({ steps = [], tourKey = '' }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!tourKey) return;
    const isNewUser = localStorage.getItem('isNewUser') === 'true';
    const hasSeenTour = localStorage.getItem(`hasSeenTour_${tourKey}`);
    if (isNewUser && !hasSeenTour) {
      // Delay starting slightly so the DOM elements are fully rendered and positioned
      const timer = setTimeout(() => {
        setIsOpen(true);
        setCurrentStepIdx(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tourKey]);

  const currentStep = steps[currentStepIdx];

  // Update target element coordinate bounds dynamically
  const updateCoordinates = () => {
    if (!isOpen || !currentStep) return;
    const element = document.querySelector(currentStep.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setCoords({
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom + scrollTop,
        right: rect.right + scrollLeft,
      });
    } else {
      // Element not found! Automatically skip this step to prevent locking
      setCoords(null);
      if (currentStepIdx < steps.length - 1) {
        setCurrentStepIdx(prev => prev + 1);
      } else {
        handleComplete();
      }
    }
  };

  useEffect(() => {
    updateCoordinates();
    
    // Add event listeners for resizing or scrolling to maintain alignment
    window.addEventListener('resize', updateCoordinates);
    window.addEventListener('scroll', updateCoordinates);
    
    return () => {
      window.removeEventListener('resize', updateCoordinates);
      window.removeEventListener('scroll', updateCoordinates);
    };
  }, [isOpen, currentStepIdx, steps]);

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    if (tourKey) {
      localStorage.setItem(`hasSeenTour_${tourKey}`, 'true');
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen || !currentStep || !coords) return null;

  // Pulse ring highlight style (dims everything else using huge shadow)
  const highlightStyle = {
    top: `${coords.top - 8}px`,
    left: `${coords.left - 8}px`,
    width: `${coords.width + 16}px`,
    height: `${coords.height + 16}px`,
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: '9999',
    boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
    borderRadius: '16px',
    border: '3px solid #10b981',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  // Determine standard position or mobile modal position
  const isMobile = window.innerWidth < 640;

  let tooltipStyle = {};

  if (isMobile) {
    // Fixed container at the bottom on mobile to ensure perfect layout fitting
    tooltipStyle = {
      position: 'fixed',
      bottom: '24px',
      left: '16px',
      right: '16px',
      zIndex: '10000',
    };
  } else {
    // Absolute alignment next to the target element on desktop
    const pos = currentStep.position || 'bottom';
    const tooltipWidth = 280;
    
    if (pos === 'bottom') {
      tooltipStyle = {
        position: 'absolute',
        top: `${coords.bottom + 16}px`,
        left: `${coords.left + (coords.width / 2) - (tooltipWidth / 2)}px`,
        width: `${tooltipWidth}px`,
        zIndex: '10000',
      };
    } else if (pos === 'top') {
      tooltipStyle = {
        position: 'absolute',
        top: `${coords.top - 180}px`, // approximate estimation, will auto size
        left: `${coords.left + (coords.width / 2) - (tooltipWidth / 2)}px`,
        width: `${tooltipWidth}px`,
        zIndex: '10000',
      };
    } else if (pos === 'left') {
      tooltipStyle = {
        position: 'absolute',
        top: `${coords.top}px`,
        left: `${coords.left - tooltipWidth - 16}px`,
        width: `${tooltipWidth}px`,
        zIndex: '10000',
      };
    } else { // right
      tooltipStyle = {
        position: 'absolute',
        top: `${coords.top}px`,
        left: `${coords.right + 16}px`,
        width: `${tooltipWidth}px`,
        zIndex: '10000',
      };
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.65), 0 0 0 0px rgba(16, 185, 129, 0.4); }
            50% { box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.65), 0 0 15px 4px rgba(16, 185, 129, 0.6); }
          }
          .tour-glow-effect {
            animation: glow-pulse 2s infinite ease-in-out;
          }
        `}
      </style>

      {/* Dimmed highlight border box overlay */}
      <div style={highlightStyle} className="tour-glow-effect" />

      {/* Tooltip Description Card */}
      <div 
        style={tooltipStyle} 
        className="bg-slate-900/95 text-white p-5 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-md transition-all duration-300 font-sans text-left"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
            Guide: Step {currentStepIdx + 1} of {steps.length}
          </span>
          <button 
            onClick={handleSkip}
            className="text-[10px] uppercase font-extrabold text-slate-400 hover:text-white transition cursor-pointer"
          >
            Skip
          </button>
        </div>

        <h3 className="text-sm font-bold text-white mb-1.5">{currentStep.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed font-semibold mb-4">{currentStep.content}</p>

        <div className="flex justify-between items-center">
          <button 
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer font-bold"
          >
            Back
          </button>
          <button 
            onClick={handleNext}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-lg transition shadow-md shadow-emerald-600/10 cursor-pointer"
          >
            {currentStepIdx === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
