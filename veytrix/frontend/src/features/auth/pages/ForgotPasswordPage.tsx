import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VeytrixLogo } from '../../../components/VeytrixLogo';
import { useAuth } from '../../../contexts/AuthContext';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email.');
    } finally {
      setIsSubmitting(false);
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
              Reset Password
            </h1>
            <p className="mt-2 text-xs md:text-sm text-muted-foreground">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="mt-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-xs md:text-sm text-foreground">
                Password reset link sent! Check your email inbox for instructions.
              </p>
              <Link
                to="/signin"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-surface-2 border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-3 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link to="/signin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
