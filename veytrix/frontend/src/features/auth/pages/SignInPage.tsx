import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { VeytrixLogo } from '../../../components/VeytrixLogo';
import { useAuth } from '../../../contexts/AuthContext';

export function SignInPage() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, signInAsDemo, isLoading } = useAuth();
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
      navigate('/home');
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Email not confirmed. Please check your email inbox for the Supabase confirmation link before logging in.');
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(msg || 'Failed to sign in. Please check your credentials and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/home');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in with Google.');
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    try {
      await signInAsDemo();
      navigate('/home');
    } catch (err: any) {
      setError(err?.message || 'Failed to enter workspace.');
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-6 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-mesh opacity-90 pointer-events-none" />
      <div className="absolute inset-0 grid-lines opacity-[0.06] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 h-[450px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[130px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 md:p-10 shadow-elegant border border-border-strong/80">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 group mb-6 no-underline">
              <VeytrixLogo className="h-9 w-9 transition group-hover:rotate-6" />
              <span className="font-display text-2xl font-bold tracking-tight text-foreground">
                VEYTRIX
              </span>
            </Link>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Sign in to Veytrix
            </h1>
            <p className="mt-2 text-xs md:text-sm text-muted-foreground">
              Access your AI creator workspace and active projects
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-xs text-destructive leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Access Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={isSubmitting || isLoading}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-primary/10 border border-primary/30 px-4 py-3 text-xs md:text-sm font-semibold text-primary hover:bg-primary/20 transition duration-200 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span>Enter Workspace Instant Demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Social Sign In Button */}
          <div className="mt-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl glass px-4 py-3 text-xs md:text-sm font-medium text-foreground hover:bg-surface-2 transition duration-200 border border-border disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.6 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9c-.8-.7-1.4-1.8-1.4-3.2z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">or email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl glass bg-surface/50 border border-border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-foreground">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl glass bg-surface/50 border border-border pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-surface/50 text-primary focus:ring-primary/40"
              />
              <label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer select-none">
                Remember me on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
