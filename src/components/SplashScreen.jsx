import React, { useEffect, useState } from 'react';
import { Sparkles, Shield, ChevronRight } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function SplashScreen({ onFinish, duration = 2400 }) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Organizing balances...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Stage 1: Progress loading animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 35) {
        setStatusMessage('Organizing your accounts...');
      } else if (pct < 70) {
        setStatusMessage('Calculating budget limits...');
      } else if (pct < 95) {
        setStatusMessage('Securing with Supabase...');
      } else {
        setStatusMessage('Welcome to LUNARA');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onFinish?.();
        }, 500); // Wait for fade-out transition
      }
    }, 40);

    return () => clearInterval(interval);
  }, [duration, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish?.();
    }, 250);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center px-6 py-12 transition-all duration-500 ${
        isFadingOut ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'linear-gradient(165deg, #1F1535 0%, #2C1E4A 45%, #3D2966 100%)',
      }}
      onClick={handleSkip}
      role="button"
      tabIndex={0}
      aria-label="Splash Screen. Tap to enter."
    >
      {/* Top Brand Tag */}
      <div className="w-full flex justify-between items-center pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-[11px] font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#BFA8F2]" />
          <span>Mindful Finance</span>
        </div>
        <button 
          type="button" 
          onClick={handleSkip}
          className="text-white/60 hover:text-white text-xs font-semibold px-2 py-1 flex items-center gap-0.5 transition"
        >
          <span>Skip</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Logo & Title */}
      <div className="flex flex-col items-center text-center space-y-6 my-auto">
        {/* Logo Card with Ambient Glow */}
        <div className="relative">
          {/* Ambient Glow */}
          <div className="absolute -inset-4 bg-[#9B87D4]/40 rounded-full blur-2xl animate-pulse" />
          
          {/* Logo Frame */}
          <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/60 border border-white/20 bg-[#2C1E4A] flex items-center justify-center">
            <img 
              src={logoImg} 
              alt="LUNARA Logo" 
              className="w-full h-full object-cover scale-105"
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-[0.25em] pl-1 font-sans">
            LUNARA
          </h1>
          <p className="text-sm font-medium text-[#C4B5E6] max-w-xs leading-relaxed">
            Personal Finance & Budget Planner
          </p>
        </div>
      </div>

      {/* Bottom Progress & Version Footer */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-4">
        {/* Progress Bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center text-xs text-[#C4B5E6] font-medium">
            <span>{statusMessage}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden backdrop-blur-xs">
            <div 
              className="h-full bg-gradient-to-r from-[#9B87D4] via-[#BFA8F2] to-white rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Security & Copyright Note */}
        <div className="flex items-center gap-2 text-[11px] text-white/50 pt-2">
          <Shield className="w-3 h-3 text-[#BFA8F2]" />
          <span>End-to-End Privacy • Supabase Secured</span>
        </div>
      </div>
    </div>
  );
}

