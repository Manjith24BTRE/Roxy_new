import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../../components/auth/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();

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
        Back to Home
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-[#1D2B64]/5 rounded-3xl p-8 shadow-[0_24px_50px_rgba(29,43,100,0.08)] relative z-10">
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
