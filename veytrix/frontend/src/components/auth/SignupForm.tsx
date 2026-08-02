import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function SignupForm() {
  const { signUpWithEmail, openAuthModal, closeAuthModal, setRedirectAfterLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await signUpWithEmail(email, password, fullName);
      if (res.session) {
        closeAuthModal();
        setRedirectAfterLogin(null);
      } else {
        setSuccessMsg("Registration initiated. Please check your inbox for verification code.");
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to sign up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      <div>
        <h2 className="text-xl font-display font-bold text-[#1D2B64]">Create your account</h2>
        <p className="text-xs text-[#1D2B64]/60 mt-1">Get started with a free Veytrix creator account</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 leading-relaxed font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 leading-relaxed font-semibold">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#1D2B64]/70 mb-1.5">Full name</label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1D2B64]/40" />
            <input
              type="text"
              required
              placeholder="Veytrix Creator"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-[#1D2B64]/10 pl-10 pr-4 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]/60 bg-white"
            />
          </div>
        </div>

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
          <label className="block text-xs font-semibold text-[#1D2B64]/70 mb-1.5">Password</label>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1D2B64] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#3B6CE7] transition disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-xs text-[#1D2B64]/60 mt-2 font-semibold">
        Already have an account?{' '}
        <button 
          onClick={() => openAuthModal('signin')} 
          className="text-[#3B6CE7] font-bold hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
