import { cn } from '@/lib/utils';
import { STEP_LABELS } from '@/constants/config';
import { Check, Settings, GitBranch, FlaskConical, BookOpen, Users, Pin, Sparkles } from 'lucide-react';

const STEP_ICONS = [Settings, GitBranch, FlaskConical, BookOpen, Users, Pin, Sparkles];

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 lg:w-52">
      {STEP_LABELS.map((label, idx) => {
        const isActive = idx === currentStep;
        const isDone = idx < currentStep;
        const Icon = STEP_ICONS[idx];
        return (
          <button
            key={idx}
            onClick={() => onStepClick(idx)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-left whitespace-nowrap transition-all',
              isActive
                ? 'surface-highest text-primary glow-primary'
                : isDone
                ? 'text-foreground hover:surface-high'
                : 'text-muted-foreground hover:surface-high'
            )}
          >
            <span
              className={cn(
                'size-7 flex items-center justify-center rounded-lg text-[11px] font-display font-bold shrink-0 transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isDone
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'surface-high text-muted-foreground'
              )}
            >
              {isDone ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
            </span>
            <span className="text-xs font-display font-medium hidden lg:inline">{label}</span>
            {isActive && <div className="hidden lg:block ml-auto w-0.5 h-5 bg-primary rounded-full" />}
          </button>
        );
      })}
    </div>
  );
}
