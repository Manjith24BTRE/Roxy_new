import React, { useState } from 'react';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ForgotPassword() {
  const { resetPassword, openAuthModal } = useAuth();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      <div>
        <button 
          onClick={() => openAuthModal('signin')}
          className="flex items-center gap-1 text-xs text-[#3B6CE7] font-bold hover:underline mb-2"
        >
          <ArrowLeft size={14} /> Back to Sign In
        </button>
        <h2 className="text-xl font-display font-bold text-[#1D2B64]">Reset Password</h2>
        <p className="text-xs text-[#1D2B64]/60 mt-1">Enter your registered email address to receive password reset links</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 leading-relaxed font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 leading-relaxed font-semibold">
          Check your email inbox for password recovery links!
        </div>
      )}

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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1D2B64] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#3B6CE7] transition disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}
