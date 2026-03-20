import { Link } from 'react-router-dom';
import {
  GitBranch, FlaskConical, Users, ShieldCheck, Printer, ArrowRight, Palette, BookOpen, Pin, Pencil, Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: GitBranch, title: 'Multi-Branch Branching', desc: 'Manage hundreds of departments and cross-functional branches without a single overlap. Our kinetic engine handles recursive constraints in real-time.' },
  { icon: FlaskConical, title: 'AI Labs', desc: 'Simulate "What If" scenarios. Test new curriculum structures before deploying them to the system.' },
  { icon: Users, title: 'Combined Classes', desc: 'Merge subjects across different groups seamlessly while maintaining room capacity logic.' },
  { icon: ShieldCheck, title: 'Real-time Conflict Detection', desc: 'Our "Sensors" identify potential conflicts before you even finish inputting your subjects. Instant feedback for complex scheduling.' },
  { icon: BookOpen, title: 'Smart Subjects', desc: 'Enter subjects once, assign to multiple branches. Support theory, practical, or both modes.' },
  { icon: Pin, title: 'Confirmed Classes', desc: 'Pin specific classes to exact slots. They stay locked during regeneration.' },
  { icon: Pencil, title: 'Edit Anytime', desc: 'Change your inputs even after generating. Modify and regenerate without losing confirmed classes.' },
  { icon: Palette, title: 'Color Coded', desc: 'Assign custom colors to subjects for visual clarity. Manual or automatic color assignment.' },
  { icon: Printer, title: 'Export & Print', desc: 'Export to PDF or Excel. Print-optimized layouts ready for notice boards.' },
];

function generateOrbs(count: number) {
  const colors = ['rgba(95, 255, 247, 0.06)', 'rgba(252, 216, 70, 0.04)', 'rgba(124, 58, 237, 0.04)', 'rgba(14, 165, 233, 0.05)'];
  return Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, size: 200 + Math.random() * 400,
    duration: 18 + Math.random() * 20, delay: Math.random() * -15, color: colors[i % colors.length],
  }));
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [orbs] = useState(() => generateOrbs(4));
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  return (
    <div className="flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {orbs.map((o) => (
          <div key={o.id} className="absolute rounded-full blur-3xl" style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.size}px`, height: `${o.size}px`, backgroundColor: o.color, animation: `floatOrb ${o.duration}s ease-in-out ${o.delay}s infinite alternate` }} />
        ))}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      </div>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="w-full px-6 lg:px-12 xl:px-20 py-20">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className={cn('lg:col-span-7 transition-all duration-700', mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary label-system mb-6">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> System Status: Optimal
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] mb-6">
                Build <span className="text-primary italic">Conflict-Free</span> Timetables in <span className="text-secondary">Seconds</span>
              </h1>

              <p className="text-muted-foreground text-lg max-w-xl mb-10 font-body leading-relaxed">
                Input branches, subjects, and constraints. TimeForge handles the rest with AI precision. Kinetic scheduling for high-performance institutions.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/generator"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-bold text-sm rounded-xl btn-bubble">
                  Start Generating <Sparkles className="size-4" />
                </Link>
                <Link to="/saved"
                  className="inline-flex items-center gap-2 px-8 py-4 surface-high font-display font-medium text-sm rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                  View Saved
                </Link>
              </div>
            </div>

            <div className={cn('hidden lg:flex lg:col-span-5 justify-end transition-all duration-700 delay-300', mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12')}>
              <div className="w-full max-w-sm glass rounded-2xl p-5 shadow-ambient ghost-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="label-system text-muted-foreground">Optimization Matrix</span>
                  <span className="label-system text-primary">98% Processed</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5 mb-3">
                  {['P1', 'P2', 'P3', 'R', 'P4', 'P5'].map((h) => (
                    <div key={h} className={cn('text-center label-system py-1', h === 'R' ? 'text-secondary' : 'text-primary/50')}>{h}</div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, di) => (
                    <div key={day} className="grid grid-cols-6 gap-1.5" style={{ animation: `fadeIn 0.3s ease-out ${di * 0.08}s both` }}>
                      {[0, 1, 2, 3, 4, 5].map((p) => {
                        if (p === 3) return <div key={p} className="h-7 rounded-lg bg-secondary/10" />;
                        const colors = ['bg-primary/20', 'bg-secondary/15', 'bg-rose-500/15', 'bg-violet-500/15', 'bg-sky-500/15'];
                        return <div key={p} className={cn('h-7 rounded-lg', colors[(di * 6 + p) % colors.length])} />;
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3">
                  <div className="size-2 rounded-full bg-emerald-400" />
                  <span className="label-system text-muted-foreground">No collisions detected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features heading */}
      <section className="px-6 lg:px-12 xl:px-20 py-16">
        <h2 className="font-display font-bold text-3xl lg:text-4xl mb-2">Engineered for Precision</h2>
        <div className="w-12 h-1 bg-primary rounded-full mb-12" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.slice(0, 6).map((f, i) => (
            <div key={f.title} className="group surface-high rounded-2xl p-6 transition-all hover:glow-primary hover:scale-[1.02]"
              style={{ animation: `fadeIn 0.4s ease-out ${i * 0.06}s both` }}>
              <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timetable preview section */}
      <section className="px-6 lg:px-12 xl:px-20 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl">Visualizing Kinetic Time</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">Every block is a data point. Every gap is an opportunity. Experience the Forge&apos;s visual clarity.</p>
          </div>
          <span className="label-system text-muted-foreground surface-high px-4 py-2 rounded-xl hidden sm:block">System Snapshot</span>
        </div>
        <div className="surface-high rounded-2xl p-6 overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left label-system text-primary">Time Slot</th>
                <th className="py-3 px-4 text-left label-system text-primary">Subject Alpha</th>
                <th className="py-3 px-4 text-left label-system text-primary">Subject Beta</th>
                <th className="py-3 px-4 text-left label-system text-primary">Subject Gamma</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 text-sm text-muted-foreground font-body">08:00 - 09:30</td>
                <td className="py-2 px-4"><div className="bg-primary/15 rounded-xl px-4 py-3 border-l-2 border-primary"><span className="font-display font-semibold text-sm">Neural Networks</span><br /><span className="label-system text-muted-foreground">Hall R1</span></div></td>
                <td className="py-2 px-4"><div className="surface-highest rounded-xl px-4 py-3 text-sm text-muted-foreground/50">Open Slot</div></td>
                <td className="py-2 px-4"><div className="bg-destructive/10 rounded-xl px-4 py-3 border-l-2 border-destructive"><span className="font-display font-semibold text-sm">Quantum Logic</span><br /><span className="label-system text-muted-foreground">Lab X</span></div></td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-muted-foreground font-body">10:00 - 11:30</td>
                <td colSpan={2} className="py-2 px-4"><div className="bg-secondary/10 rounded-xl px-4 py-3 border-l-2 border-secondary"><span className="font-display font-semibold text-sm">Kinetic Engineering Workshop</span><br /><span className="label-system text-muted-foreground">The Forge Main Arena</span><span className="ml-3 px-2 py-0.5 bg-secondary/20 text-secondary rounded-lg label-system">Combined</span></div></td>
                <td className="py-2 px-4"><div className="surface-highest rounded-xl px-4 py-3 text-sm text-muted-foreground/50">Open Slot</div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-6 lg:mx-12 xl:mx-20 mb-16 rounded-2xl bg-primary/5 p-10 lg:p-14 text-center">
        <h3 className="font-display font-bold text-3xl mb-3">Ready to Forge Your Future?</h3>
        <p className="text-muted-foreground text-base max-w-md mx-auto mb-8">
          Eliminate scheduling friction and unleash institutional efficiency today.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/generator" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-bold text-sm rounded-xl btn-bubble">
            Ignite Generator
          </Link>
          <span className="label-system text-muted-foreground">Free to Start · Pro Tiers Available</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 xl:px-20 py-10 surface-low">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <h4 className="font-display font-bold text-base mb-2 text-primary">TimeForge</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
              The world&apos;s first kinetic timetable engine designed for the architectural complexity of modern education.
            </p>
          </div>
          <div>
            <h5 className="label-system text-muted-foreground mb-3">Navigation</h5>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <Link to="/generator" className="block hover:text-primary transition-colors">Generator</Link>
              <Link to="/saved" className="block hover:text-primary transition-colors">Saved</Link>
            </div>
          </div>
          <div>
            <h5 className="label-system text-muted-foreground mb-3">Support</h5>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>System Status</p>
              <p>Labs Feedback</p>
              <p>Privacy Policy</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 flex items-center justify-between text-xs text-muted-foreground/40">
          <p>&copy; 2026 TimeForge Kinetic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
