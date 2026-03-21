import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sparkles, LogIn, Eye, EyeOff, Mail, Lock, UserPlus } from 'lucide-react';
import { supabase } from '@/supabaseClient';

function generateOrbs(count: number) {
  const colors = ['rgba(95, 255, 247, 0.12)', 'rgba(252, 216, 70, 0.08)', 'rgba(124, 58, 237, 0.06)', 'rgba(14, 165, 233, 0.08)'];
  return Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, size: 100 + Math.random() * 350,
    duration: 16 + Math.random() * 22, delay: Math.random() * -18, color: colors[i % colors.length],
  }));
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orbs] = useState(() => generateOrbs(5));
  const [mounted, setMounted] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error: signInError, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    } else if (data.session) {
      localStorage.setItem('timeforge-auth', 'true');
      setIsLoading(false);
      navigate('/home');
    } else {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  }, [email, password, navigate]);

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
    } else if (data.session) {
      // User signed up and session was created (email confirmation disabled)
      localStorage.setItem('timeforge-auth', 'true');
      setIsLoading(false);
      navigate('/home');
    } else {
      // Email confirmation required
      setError('Check your email and confirm your account before logging in.');
      setIsLoading(false);
    }
  }, [email, password, navigate]);

  const handleSubmit = isSignUp ? handleSignUp : handleLogin;

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

          <h2 className="font-display font-bold text-xl mb-1">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
          <p className="text-sm text-muted-foreground mb-6">{isSignUp ? 'Create your forging environment.' : 'Access your forging environment.'}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="label-system text-muted-foreground">Email Address</span>
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="commander@timeforge.io" required
                  className="w-full h-12 pl-11 pr-4 surface-highest rounded-xl text-sm font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="label-system text-muted-foreground">Password</span>
                {!isSignUp && <button type="button" className="label-system text-primary hover:underline">Forgot Access?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" required minLength={6}
                  className="w-full h-12 pl-11 pr-11 surface-highest rounded-xl text-sm font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{error}</p>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 btn-bubble disabled:opacity-60">
              {isLoading ? <div className="size-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <><span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>{isSignUp ? <UserPlus className="size-4" /> : <LogIn className="size-4" />}</>}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="label-system text-primary hover:underline">
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
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
