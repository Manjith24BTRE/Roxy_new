import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function LoginForm() {
  const { signInWithEmail, signInWithGoogle, signInAsDemo, openAuthModal, closeAuthModal, redirectAfterLogin, setRedirectAfterLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithEmail(email, password, rememberMe);
      closeAuthModal();
      setRedirectAfterLogin(null);
      navigate('/home');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    try {
      await signInAsDemo();
      closeAuthModal();
      setRedirectAfterLogin(null);
      navigate('/home');
    } catch (err: any) {
      setError(err?.message || 'Failed to enter workspace.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      closeAuthModal();
      setRedirectAfterLogin(null);
      navigate('/home');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in with Google.');
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      <div>
        <h2 className="text-xl font-display font-bold text-[#1D2B64]">Sign in to Veytrix</h2>
        <p className="text-xs text-[#1D2B64]/60 mt-1">Access your AI creator workspace and active projects</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 leading-relaxed font-semibold">
          {error}
        </div>
      )}

      {/* Instant Demo */}
      <button
        type="button"
        onClick={handleDemoSignIn}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3B6CE7]/10 border border-[#3B6CE7]/20 px-4 py-3 text-xs font-bold text-[#3B6CE7] hover:bg-[#3B6CE7]/15 transition shadow-sm"
      >
        <Sparkles size={14} className="animate-pulse" />
        <span>Enter Workspace Instant Demo</span>
        <ArrowRight size={14} />
      </button>

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#1D2B64]/10 bg-white px-4 py-3 text-xs font-semibold text-[#1D2B64] hover:bg-[#E6F2F8]/30 transition"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.6 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
          <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9c-.8-.7-1.4-1.8-1.4-3.2z" />
          <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-[#1D2B64]/5" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#1D2B64]/40 font-bold">or email</span>
        <div className="flex-1 h-px bg-[#1D2B64]/5" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#1D2B64]/70 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1D2B64]/40" />
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#1D2B64]/10 pl-10 pr-4 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]/60 bg-white"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#1D2B64]/70">Password</label>
            <button 
              type="button"
              onClick={() => openAuthModal('forgot')} 
              className="text-xs text-[#3B6CE7] hover:underline font-semibold"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1D2B64]/40" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#1D2B64]/10 pl-10 pr-10 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]/60 bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1D2B64]/40 hover:text-[#1D2B64]"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-[#1D2B64]/10 bg-white text-[#3B6CE7]"
          />
          <label htmlFor="rememberMe" className="text-xs text-[#1D2B64]/60 cursor-pointer select-none font-semibold">
            Remember me on this device
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1D2B64] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#3B6CE7] transition disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-xs text-[#1D2B64]/60 mt-2 font-semibold">
        Don't have an account?{' '}
        <button 
          onClick={() => openAuthModal('signup')} 
          className="text-[#3B6CE7] font-bold hover:underline"
        >
          Create account
        </button>
      </p>
    </div>
  );
}
