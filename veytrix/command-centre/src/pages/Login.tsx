import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useControlCentreAuth } from '../context/ControlCentreAuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, session, isLoading, isUnauthorizedNormalUser } = useControlCentreAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (!isLoading) {
      if (isUnauthorizedNormalUser) {
        window.location.href = '/home';
      } else if (session) {
        const from = (location.state as any)?.from?.pathname || '/command-centre/dashboard';
        navigate(from, { replace: true });
      }
    }
  }, [session, isUnauthorizedNormalUser, isLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { success, error: loginError } = await login(email, password, rememberMe);
      if (success) {
        const from = (location.state as any)?.from?.pathname || '/command-centre/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(loginError || 'Invalid login credentials');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid login credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError('Google authentication is not available for the Control Centre. Please use your controller credentials.');
  };

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center bg-[#F9FBFC]">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F9FBFC] relative overflow-hidden px-4">
      {/* Background ambient light effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#3B6CE7]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1D2B64]/5 blur-[120px] pointer-events-none" />

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-[#1D2B64]/60 hover:text-[#1D2B64] transition bg-white/80 hover:bg-white border border-[#1D2B64]/5 px-4 py-2 rounded-full shadow-sm cursor-pointer z-10"
      >
        <ArrowLeft size={14} />
        Back to Application
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-[#1D2B64]/5 rounded-3xl p-8 shadow-[0_24px_50px_rgba(29,43,100,0.08)] relative z-10">
        <div className="flex flex-col gap-4 text-left">
          <div>
            <h2 className="text-xl font-display font-bold text-[#1D2B64]">Veytrix Command Centre</h2>
            <p className="text-xs text-[#1D2B64]/60 mt-1">Authorized controller access only</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 leading-relaxed font-semibold">
              {error}
            </div>
          )}

          {/* Google button (Disabled/Mocked for Control Centre) */}
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
                  placeholder="official@mavrostech.in"
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
                  onClick={() => setError('Password recovery is unavailable for Command Centre accounts.')}
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

          <p className="text-center text-xs text-[#1D2B64]/60 mt-2 font-semibold flex flex-col gap-1">
            <span className="text-[#1D2B64]/40 italic">(Command Centre is restricted to administrators)</span>
            <button 
              onClick={() => setError('You cannot create an account from the Command Centre.')}
              className="text-[#3B6CE7] font-bold hover:underline opacity-50 cursor-not-allowed"
              title="Disabled"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
