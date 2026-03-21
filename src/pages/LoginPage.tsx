import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sparkles, LogIn, Eye, EyeOff, Mail, Lock, UserPlus, CheckCircle } from 'lucide-react';
import { supabase, signInWithGoogle } from '@/supabaseClient';

function generateOrbs(count: number) {
  const colors = ['rgba(95, 255, 247, 0.12)', 'rgba(252, 216, 70, 0.08)', 'rgba(124, 58, 237, 0.06)', 'rgba(14, 165, 233, 0.08)'];
  return Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, size: 100 + Math.random() * 350,
    duration: 16 + Math.random() * 22, delay: Math.random() * -18, color: colors[i % colors.length],
  }));
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orbs] = useState(() => generateOrbs(5));
  const [mounted, setMounted] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-fill email from query parameter when on Sign In page
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setSuccess('Your account has been created. Please check your email and verify your address before logging in.');
    }
  }, [searchParams]);

  // Handle OAuth callback
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem('timeforge-auth', 'true');
        navigate('/home');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

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
      // Email confirmation required - redirect to Sign In with email pre-filled
      setIsLoading(false);
      navigate(`/login?email=${encodeURIComponent(email)}`);
    }
  }, [email, password, navigate]);

  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    setError('');

    const { error: googleError } = await signInWithGoogle();

    if (googleError) {
      setError(googleError.message);
      setIsLoading(false);
    }
    // Note: User will be redirected to Google, so no need to handle success here
  }, []);

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

            {success && (
              <p className="text-sm text-green-500 bg-green-500/10 p-3 rounded flex items-start gap-2">
                <CheckCircle className="size-4 mt-0.5 flex-shrink-0" />
                {success}
              </p>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{error}</p>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 btn-bubble disabled:opacity-60">
              {isLoading ? <div className="size-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <><span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>{isSignUp ? <UserPlus className="size-4" /> : <LogIn className="size-4" />}</>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted-foreground/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground label-system">Or continue with</span>
            </div>
          </div>

          <button type="button" onClick={handleGoogleLogin} disabled={isLoading}
            className="w-full h-12 surface-highest rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors disabled:opacity-60 border border-muted-foreground/20">
            <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="mt-4 text-center">
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }} className="label-system text-primary hover:underline">
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
