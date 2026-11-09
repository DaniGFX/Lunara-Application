import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  X,
  KeyRound
} from 'lucide-react';
import { signIn, signUp, resetPassword, DEMO_USER } from '../services/authService';
import logoImg from '../assets/logo.jpg';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotFeedback, setForgotFeedback] = useState(null);

  useBodyScrollLock(isForgotModalOpen);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }

      setIsLoading(true);
      const res = await signUp({ email, password, fullName });
      setIsLoading(false);

      if (res.ok) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onAuthSuccess(res.user);
        }, 800);
      } else {
        setErrorMessage(res.message);
      }
    } else {
      // Sign In mode
      setIsLoading(true);
      const res = await signIn({ email, password });
      setIsLoading(false);

      if (res.ok) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onAuthSuccess(res.user);
        }, 600);
      } else {
        setErrorMessage(res.message);
      }
    }
  };

  // Demo user quick login
  const handleDemoLogin = () => {
    setErrorMessage('');
    setSuccessMessage('Entering as Sofia Rodriguez...');
    setTimeout(() => {
      onAuthSuccess(DEMO_USER);
    }, 400);
  };

  // Forgot password handler
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotFeedback({ ok: false, message: 'Please enter your email.' });
      return;
    }

    setIsForgotLoading(true);
    const res = await resetPassword(forgotEmail);
    setIsForgotLoading(false);
    setForgotFeedback(res);
  };

  return (
    <div className="min-h-screen bg-[#F8F6FC] flex flex-col justify-between px-6 py-8">
      {/* Top Branding */}
      <div className="flex flex-col items-center text-center pt-4">
        {/* Logo Card with soft ambient glow */}
        <div className="relative mb-3">
          <div className="absolute -inset-2 bg-[#9B87D4]/30 rounded-full blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md border border-[#EAE3FA] bg-[#2C1E4A] flex items-center justify-center">
            <img 
              src={logoImg} 
              alt="LUNARA Logo" 
              className="w-full h-full object-cover scale-105"
            />
          </div>
        </div>

        <h1 className="text-2xl font-black text-[#2C1E4A] tracking-wider">
          LUNARA
        </h1>
        <p className="text-xs font-semibold text-[#7A7289] mt-0.5">
          Mindful Personal Finance & Budgeting
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F0EBF8] space-y-5 my-auto">
        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex p-1 bg-[#F8F6FC] rounded-2xl border border-[#F0EBF8]">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'signin'
                ? 'bg-white text-[#2C1E4A] shadow-xs'
                : 'text-[#7A7289] hover:text-[#2C1E4A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#2C1E4A] shadow-xs'
                : 'text-[#7A7289] hover:text-[#2C1E4A]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name field (Sign Up only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#574477] block">
                Full Name
              </label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 text-[#9E97A9] absolute left-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sofia Rodriguez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-[#F8F6FC] rounded-2xl border border-[#F0EBF8] text-sm text-[#2C1E4A] placeholder:text-[#9E97A9] focus:outline-none focus:border-[#9B87D4] transition"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#574477] block">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#9E97A9] absolute left-3.5" />
              <input
                type="email"
                required
                autoCapitalize="none"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-[#F8F6FC] rounded-2xl border border-[#F0EBF8] text-sm text-[#2C1E4A] placeholder:text-[#9E97A9] focus:outline-none focus:border-[#9B87D4] transition"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#574477]">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotFeedback(null);
                    setForgotEmail(email);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-[#9B87D4] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#9E97A9] absolute left-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 bg-[#F8F6FC] rounded-2xl border border-[#F0EBF8] text-sm text-[#2C1E4A] placeholder:text-[#9E97A9] focus:outline-none focus:border-[#9B87D4] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#9E97A9] hover:text-[#574477] p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#574477] block">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#9E97A9] absolute left-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-[#F8F6FC] rounded-2xl border border-[#F0EBF8] text-sm text-[#2C1E4A] placeholder:text-[#9E97A9] focus:outline-none focus:border-[#9B87D4] transition"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#9B87D4] hover:bg-[#8B75C8] active:scale-[0.98] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex-1 h-px bg-[#F0EBF8]" />
          <span className="text-[11px] font-bold text-[#9E97A9] uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-[#F0EBF8]" />
        </div>

        {/* Quick Demo Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-3 px-4 rounded-2xl bg-[#EAE3FA] hover:bg-[#DDD2F5] active:scale-[0.98] text-[#2C1E4A] font-bold text-xs flex items-center justify-center gap-2 border border-[#9B87D4]/30 transition"
        >
          <Sparkles className="w-4 h-4 text-[#9B87D4]" />
          <span>Continue as Demo User (Sofia)</span>
        </button>
      </div>

      {/* Security Footnote */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#7A7289] pt-4 text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-[#9B87D4]" />
        <span>Protected by Supabase Authentication • 256-bit encryption</span>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#F0EBF8] space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#EAE3FA] flex items-center justify-center text-[#9B87D4]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-[#2C1E4A]">Reset Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F8F6FC] text-[#574477] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7A7289] leading-relaxed">
              Enter your registered email address. We'll send you a secure link to reset your password.
            </p>

            {forgotFeedback && (
              <div className={`p-3 rounded-2xl text-xs font-semibold ${
                forgotFeedback.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'
              }`}>
                {forgotFeedback.message}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#F8F6FC] rounded-2xl border border-[#F0EBF8] text-sm text-[#2C1E4A] focus:outline-none focus:border-[#9B87D4]"
              />

              <button
                type="submit"
                disabled={isForgotLoading}
                className="w-full h-11 bg-[#9B87D4] hover:bg-[#8B75C8] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                {isForgotLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

