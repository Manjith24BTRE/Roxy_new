import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Sparkles, MailCheck } from 'lucide-react';
import { VeytrixLogo } from '../../../components/VeytrixLogo';
import { useAuth } from '../../../contexts/AuthContext';

export function SignUpPage() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, signInAsDemo, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-border' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-destructive' };
    if (score === 2 || score === 3) return { score: 65, label: 'Medium', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsConfirmation(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signUpWithEmail(email, password, fullName);
      if (res.session) {
        navigate('/home');
      } else {
        setNeedsConfirmation(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please check details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/home');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign up with Google.');
    }
  };

  const handleDemoSignUp = async () => {
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
              Create your account
            </h1>
            <p className="mt-2 text-xs md:text-sm text-muted-foreground">
              Join Veytrix and unlock AI video creation capabilities
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {needsConfirmation ? (
            <div className="mt-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/20 text-primary">
                <MailCheck className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Check your email inbox</h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                We've sent a verification link to <strong className="text-foreground">{email}</strong>. Please confirm your email address to complete registration and sign in.
              </p>
              <Link
                to="/signin"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Quick Demo Access Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleDemoSignUp}
                  disabled={isSubmitting || isLoading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-primary/10 border border-primary/30 px-4 py-3 text-xs md:text-sm font-semibold text-primary hover:bg-primary/20 transition duration-200 shadow-sm"
                >
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span>Enter Workspace Instant Demo</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Social Sign Up */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isSubmitting || isLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl glass px-4 py-3 text-xs md:text-sm font-medium text-foreground hover:bg-surface-2 transition duration-200 border border-border disabled:opacity-50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.6 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                    <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9c-.8-.7-1.4-1.8-1.4-3.2z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
                  </svg>
                  <span>Sign up with Google</span>
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
                  <label className="block text-xs font-medium text-foreground mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl glass bg-surface/50 border border-border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 transition"
                    />
                  </div>
                </div>

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
                  <label className="block text-xs font-medium text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
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

                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Strength:</span>
                        <span className="font-medium">{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl glass bg-surface/50 border border-border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 transition"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border bg-surface/50 text-primary focus:ring-primary/40"
                  />
                  <label htmlFor="agreeTerms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                    I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
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
                      <span>Create Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link to="/signin" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
