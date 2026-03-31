import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/supabaseClient';

function generateOrbs(count: number) {
  const colors = ['rgba(95, 255, 247, 0.12)', 'rgba(252, 216, 70, 0.08)', 'rgba(124, 58, 237, 0.06)', 'rgba(14, 165, 233, 0.08)'];
  return Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, size: 100 + Math.random() * 350,
    duration: 16 + Math.random() * 22, delay: Math.random() * -18, color: colors[i % colors.length],
  }));
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orbs] = useState(() => generateOrbs(5));
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
    }
  }, [email]);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {orbs.map((orb) => (
            <div key={orb.id} className="absolute rounded-full blur-3xl"
              style={{ left: `${orb.x}%`, top: `${orb.y}%`, width: `${orb.size}px`, height: `${orb.size}px`, backgroundColor: orb.color, animation: `floatOrb ${orb.duration}s ease-in-out ${orb.delay}s infinite alternate` }} />
          ))}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className={cn('relative z-10 w-full max-w-md mx-4 transition-all duration-700', mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95')}>
          <div className="rounded-2xl glass shadow-ambient p-8 ghost-border text-center">
            <div className="size-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="size-8 text-green-500" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Check Your Email</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Click the link in the email to reset your password. The link will redirect you back to this app.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-display font-bold text-primary hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {orbs.map((orb) => (
          <div key={orb.id} className="absolute rounded-full blur-3xl"
            style={{ left: `${orb.x}%`, top: `${orb.y}%`, width: `${orb.size}px`, height: `${orb.size}px`, backgroundColor: orb.color, animation: `floatOrb ${orb.duration}s ease-in-out ${orb.delay}s infinite alternate` }} />
        ))}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Decorative corner text */}
      <div className="absolute top-6 right-8 hidden sm:block">
        <span className="label-system text-primary/40">Forge_01</span>
        <div className="w-8 h-0.5 bg-primary/30 mt-1 ml-auto" />
      </div>

      {/* Decorative sidebar text */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-1 writing-vertical">
        <span className="label-system text-muted-foreground/20 [writing-mode:vertical-lr]">System_Auth_v4.0.2 // Protocol_Active</span>
      </div>

      <div className={cn('relative z-10 w-full max-w-md mx-4 transition-all duration-700', mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95')}>
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-4xl tracking-tight text-primary mb-2">TimeForge</h1>
          <p className="label-system text-muted-foreground">Kinetic Precision Interface</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl glass shadow-ambient p-8 ghost-border">
          <div className="flex items-center gap-2 mb-6">
            <div className="size-2 rounded-full bg-primary" />
            <div className="size-2 rounded-full bg-secondary" />
            <div className="size-2 rounded-full bg-muted-foreground/40" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate('/login')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-5" />
            </button>
            <h2 className="font-display font-bold text-xl mb-1">Reset Password</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Enter your email address and we'll send you a link to reset your password.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="label-system text-muted-foreground">Email Address</span>
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander@timeforge.io"
                  required
                  className="w-full h-12 pl-11 pr-4 surface-highest rounded-xl text-sm font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 btn-bubble disabled:opacity-60"
            >
              {isLoading ? (
                <div className="size-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <Sparkles className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="label-system text-primary hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <span className="label-system text-muted-foreground/40 flex items-center justify-center gap-2">
            <span className="size-1.5 rounded-full bg-secondary" /> Secure Quantum Encryption Active
          </span>
        </div>
      </div>
    </div>
  );
}
