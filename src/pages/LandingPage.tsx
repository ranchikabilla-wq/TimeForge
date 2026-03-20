import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  ArrowRight, Sparkles, Zap, ShieldCheck, Pin, FlaskConical,
  GitBranch, Clock, Layers, GripVertical, ChevronDown,
} from 'lucide-react';
import robotHero from '@/assets/robot-hero.jpg';
import carHero from '@/assets/car-hero.jpg';
import robotArm from '@/assets/robot-arm.jpg';

/* ─── Orbs ─── */
function generateOrbs(count: number) {
  const colors = [
    'rgba(95, 255, 247, 0.08)',
    'rgba(252, 216, 70, 0.05)',
    'rgba(124, 58, 237, 0.04)',
    'rgba(14, 165, 233, 0.06)',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 250 + Math.random() * 400,
    duration: 18 + Math.random() * 20,
    delay: Math.random() * -15,
    color: colors[i % colors.length],
  }));
}

/* ─── Features ─── */
const FEATURES = [
  { icon: GitBranch, title: 'Multi-Branch Scheduling', desc: 'Simultaneously schedule hundreds of departments without a single overlap. Our kinetic engine resolves recursive constraints in real-time.' },
  { icon: FlaskConical, title: 'Lab & Room Management', desc: 'Automatically assign physical lab rooms with capacity and type matching. Detect and prevent room conflicts across all branches.' },
  { icon: Pin, title: 'Confirmed Class Pinning', desc: 'Pin critical classes to exact time slots. These locked entries are never disturbed during regeneration or drag-and-drop edits.' },
  { icon: ShieldCheck, title: 'Zero-Collision Guarantee', desc: 'No teacher double-bookings, no room conflicts, no overlapping combined classes. Every constraint is validated before output.' },
  { icon: GripVertical, title: 'Drag-and-Drop Editing', desc: 'Fine-tune generated schedules by dragging subjects between slots. Full undo/redo history with 50-step rollback support.' },
  { icon: Layers, title: '5 Viewing Modes', desc: 'Branch-wise, teacher-wise, subject-wise, all-departments master view, and lab-room utilization view — all from one generated dataset.' },
];

/* ─── Stats ─── */
const STATS = [
  { value: '< 2s', label: 'Generation Time' },
  { value: '100%', label: 'Conflict-Free' },
  { value: '∞', label: 'Branches Supported' },
  { value: '5', label: 'View Modes' },
];

/* ─── How it works steps ─── */
const STEPS = [
  { num: '01', title: 'Configure', desc: 'Set periods, working days, recess, and start time.' },
  { num: '02', title: 'Input Data', desc: 'Add branches, subjects, teachers, labs, and combined classes.' },
  { num: '03', title: 'Pin & Lock', desc: 'Optionally pin confirmed classes to fixed slots.' },
  { num: '04', title: 'Generate', desc: 'One click — conflict-free timetables for every branch, instantly.' },
];

/* ─── Animated counter ─── */
function useCountUp(end: string, duration = 1800) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const numericMatch = end.match(/\d+/);
          if (!numericMatch) {
            setDisplay(end);
            return;
          }
          const target = parseInt(numericMatch[0]);
          const prefix = end.slice(0, end.indexOf(numericMatch[0]));
          const suffix = end.slice(end.indexOf(numericMatch[0]) + numericMatch[0].length);
          const startTime = performance.now();
          function animate(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            setDisplay(`${prefix}${current}${suffix}`);
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return { ref, display };
}

/* ─── Parallax image ─── */
function ParallaxImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    function handleScroll() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewH = window.innerHeight;
      const ratio = (rect.top + rect.height / 2 - viewH / 2) / viewH;
      setOffset(ratio * -40);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-100 will-change-transform"
        style={{ transform: `translateY(${offset}px) scale(1.1)` }}
      />
    </div>
  );
}

/* ─── Main Component ─── */
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [orbs] = useState(() => generateOrbs(5));

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {orbs.map((o) => (
          <div
            key={o.id}
            className="absolute rounded-full blur-3xl"
            style={{
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: `${o.size}px`,
              height: `${o.size}px`,
              backgroundColor: o.color,
              animation: `floatOrb ${o.duration}s ease-in-out ${o.delay}s infinite alternate`,
            }}
          />
        ))}
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* ═══════ NAV ═══════ */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-12 xl:px-20 py-5">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center glow-primary">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div>
            <span className="font-display font-bold text-lg">
              <span className="text-primary">Time</span>Forge
            </span>
            <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-display -mt-0.5">
              Kinetic Precision
            </p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-display font-medium text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#showcase" className="hover:text-primary transition-colors">Showcase</a>
        </nav>
        <Link
          to="/login"
          className="px-6 py-2.5 text-sm font-display font-semibold surface-high rounded-xl ghost-border transition-all hover:scale-[1.02] hover:glow-primary active:scale-[0.98]"
        >
          Sign In
        </Link>
      </header>

      {/* ═══════ HERO ═══════ */}
      <section className="relative z-10 px-6 lg:px-12 xl:px-20 pt-12 lg:pt-20 pb-20 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center max-w-7xl mx-auto">
          {/* Left — Copy */}
          <div
            className={cn(
              'transition-all duration-700',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary label-system mb-6">
              <Zap className="size-3" /> System Status: Optimal
            </div>
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6">
              Build{' '}
              <span className="text-primary italic">Conflict-Free</span>
              <br />
              Timetables in{' '}
              <span className="text-secondary">Seconds</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mb-10 font-body leading-relaxed">
              Input branches, subjects, teachers, and constraints. TimeForge handles the rest with AI precision.
              Kinetic scheduling for high-performance institutions.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-bold text-sm rounded-xl btn-bubble"
              >
                Get Started <ArrowRight className="size-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-4 surface-high rounded-xl ghost-border text-sm font-display font-semibold text-muted-foreground hover:text-foreground transition-all hover:glow-primary"
              >
                Explore Features <ChevronDown className="size-4" />
              </a>
            </div>
          </div>

          {/* Right — Robot hero image */}
          <div
            className={cn(
              'relative transition-all duration-1000 delay-200',
              mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
            )}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-ambient">
              <img
                src={robotHero}
                alt="Futuristic robot managing holographic timetable"
                className="w-full h-auto object-cover rounded-2xl"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />
              {/* Corner label */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <p className="label-system text-primary">Optimization Matrix</p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    Real-time constraint resolution
                  </p>
                </div>
                <div className="label-system text-secondary">89% Processed</div>
              </div>
            </div>
            {/* Floating accent badge */}
            <div className="absolute -top-3 -right-3 lg:-top-4 lg:-right-4 size-16 lg:size-20 rounded-2xl bg-secondary/15 backdrop-blur-sm flex items-center justify-center ghost-border animate-pulse">
              <Clock className="size-6 lg:size-8 text-secondary" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ STATS BAR ═══════ */}
      <section className="relative z-10 px-6 lg:px-12 xl:px-20 py-8">
        <div className="max-w-5xl mx-auto surface-high rounded-2xl ghost-border p-6 lg:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {STATS.map((s) => {
              const counter = useCountUp(s.value);
              return (
                <div key={s.label} ref={counter.ref} className="text-center">
                  <p className="font-display font-bold text-3xl lg:text-4xl text-primary tabular-nums">
                    {counter.display}
                  </p>
                  <p className="label-system text-muted-foreground mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="features" className="relative z-10 px-6 lg:px-12 xl:px-20 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 lg:mb-16">
            <span className="label-system text-secondary mb-3 block">Core Capabilities</span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl">
              Engineered for <span className="text-primary italic">Precision</span>
            </h2>
            <div className="w-12 h-1 bg-secondary rounded-full mt-4" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group surface-high rounded-2xl p-6 transition-all hover:glow-primary hover:scale-[1.015] ghost-border"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <f.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ROBOT ARM + CAR SHOWCASE ═══════ */}
      <section id="showcase" className="relative z-10 px-6 lg:px-12 xl:px-20 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Robot arm row */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <ParallaxImage
              src={robotArm}
              alt="Robotic arm placing timetable blocks"
              className="rounded-2xl h-72 lg:h-96 shadow-ambient ghost-border"
            />
            <div>
              <span className="label-system text-secondary mb-3 block">Precision Engine</span>
              <h3 className="font-display font-bold text-2xl lg:text-3xl mb-4">
                Robotic <span className="text-primary italic">Slot Placement</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed font-body mb-6">
                Our multi-pass scheduling algorithm works like a precision robotic arm — placing
                combined classes first, then lab sessions, then theory subjects. Each placement is
                validated against every active constraint before committing. Zero guesswork.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Combined First', 'Labs Second', 'Theory Fill', 'Conflict Check'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-lg surface-highest label-system text-primary ghost-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Car row */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="label-system text-secondary mb-3 block">Performance</span>
              <h3 className="font-display font-bold text-2xl lg:text-3xl mb-4">
                Built for <span className="text-secondary italic">Speed</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed font-body mb-6">
                Like a high-performance machine, TimeForge generates complete, conflict-free
                timetables in under 2 seconds — regardless of the number of branches,
                subjects, or constraints. No loading bars. No waiting. Instant results.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="surface-highest rounded-xl p-4 ghost-border">
                  <p className="font-display font-bold text-2xl text-secondary">1.2s</p>
                  <p className="label-system text-muted-foreground mt-1">Avg. 8-Branch Gen</p>
                </div>
                <div className="surface-highest rounded-xl p-4 ghost-border">
                  <p className="font-display font-bold text-2xl text-primary">0</p>
                  <p className="label-system text-muted-foreground mt-1">Collisions</p>
                </div>
              </div>
            </div>
            <ParallaxImage
              src={carHero}
              alt="Futuristic high-performance concept car"
              className="rounded-2xl h-72 lg:h-96 shadow-ambient ghost-border order-1 lg:order-2"
            />
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="relative z-10 px-6 lg:px-12 xl:px-20 py-20 lg:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <span className="label-system text-secondary mb-3 block">Process Flow</span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl">
              How <span className="text-primary italic">TimeForge</span> Works
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative group">
                <div className="surface-high rounded-2xl p-6 ghost-border transition-all hover:glow-primary h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-display font-bold text-3xl text-primary/20 group-hover:text-primary/50 transition-colors">
                      {step.num}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                        <ArrowRight className="size-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-display font-bold text-base mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-body">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TIMETABLE PREVIEW SNAPSHOT ═══════ */}
      <section className="relative z-10 px-6 lg:px-12 xl:px-20 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="label-system text-secondary mb-2 block">Visual Output</span>
              <h3 className="font-display font-bold text-2xl">
                Visualizing Kinetic <span className="text-primary">Time</span>
              </h3>
            </div>
            <span className="label-system text-muted-foreground surface-high px-3 py-1.5 rounded-lg ghost-border hidden sm:block">
              System Snapshot
            </span>
          </div>

          {/* Mock timetable */}
          <div className="surface-high rounded-2xl overflow-hidden ghost-border">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="surface-highest px-4 py-3 text-left label-system text-muted-foreground w-32">
                    Time Slot
                  </th>
                  <th className="surface-highest px-4 py-3 text-left label-system text-primary">CSE</th>
                  <th className="surface-highest px-4 py-3 text-left label-system text-primary">ECE</th>
                  <th className="surface-highest px-4 py-3 text-left label-system text-primary hidden sm:table-cell">
                    ME
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-body">08:30 – 09:15</td>
                  <td className="px-4 py-3">
                    <div className="rounded-xl bg-primary/10 border-l-2 border-primary px-3 py-2">
                      <p className="text-xs font-display font-bold text-primary">Data Structures</p>
                      <p className="text-[10px] text-muted-foreground">Prof. Kumar</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="rounded-xl surface-highest px-3 py-2">
                      <p className="text-xs text-muted-foreground/40">Open Slot</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="rounded-xl bg-violet-500/10 border-l-2 border-violet-400 px-3 py-2">
                      <p className="text-xs font-display font-bold text-violet-300">Thermodynamics</p>
                      <p className="text-[10px] text-muted-foreground">Dr. Patel</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-body">09:15 – 10:00</td>
                  <td className="px-4 py-3" colSpan={1}>
                    <div className="rounded-xl bg-secondary/10 border-l-2 border-secondary px-3 py-2">
                      <p className="text-xs font-display font-bold text-secondary">OS Lab</p>
                      <p className="text-[10px] text-muted-foreground">Lab-C1 · Prof. Singh</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="rounded-xl bg-emerald-500/10 border-l-2 border-emerald-400 px-3 py-2">
                      <p className="text-xs font-display font-bold text-emerald-300">Signals</p>
                      <p className="text-[10px] text-muted-foreground">Dr. Gupta</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="rounded-xl bg-sky-500/10 border-l-2 border-sky-400 px-3 py-2">
                      <p className="text-xs font-display font-bold text-sky-300">Eng. Math III</p>
                      <p className="text-[10px] text-muted-foreground">
                        <span className="text-sky-400/70">COMBINED</span> · Prof. Roy
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="relative z-10 px-6 lg:px-12 xl:px-20 py-20 lg:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl lg:text-5xl mb-6">
            Ready to <span className="text-primary italic">Forge</span> Your Future?
          </h2>
          <p className="text-lg text-muted-foreground font-body mb-10 max-w-xl mx-auto">
            Eliminate scheduling friction and unleash institutional efficiency today.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-display font-bold text-sm rounded-xl btn-bubble"
          >
            Ignite Generator <Sparkles className="size-4" />
          </Link>
          <p className="label-system text-muted-foreground/50 mt-4">Free to start · No credit card required</p>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative z-10 px-6 lg:px-12 xl:px-20 py-8 surface-high mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Sparkles className="size-4 text-primary" />
            <span className="font-display font-bold text-sm">
              <span className="text-primary">Time</span>Forge
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-body text-center">
            The kinetic timetable engine for modern engineering institutions.
          </p>
          <p className="label-system text-muted-foreground/40">
            © {new Date().getFullYear()} TimeForge Kinetic
          </p>
        </div>
      </footer>
    </div>
  );
}
