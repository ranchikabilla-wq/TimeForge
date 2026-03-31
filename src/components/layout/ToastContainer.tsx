import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useToastStore } from '@/stores/toastStore';
import { cn } from '@/lib/utils';

const variantConfig: Record<string, { bg: string; icon: typeof Info; iconColor: string }> = {
  default: { bg: 'surface-highest ghost-border', icon: Info, iconColor: 'text-primary' },
  destructive: { bg: 'bg-destructive/10 ghost-border', icon: AlertTriangle, iconColor: 'text-destructive' },
  success: { bg: 'bg-emerald-500/10 ghost-border', icon: CheckCircle2, iconColor: 'text-emerald-400' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const config = variantConfig[t.variant] ?? variantConfig.default;
        const Icon = config.icon;
        return (
          <div
            key={t.id}
            className={cn('rounded-xl px-4 py-3 shadow-ambient fade-in flex items-start gap-3 glass', config.bg)}
          >
            <Icon className={cn('size-4 mt-0.5 shrink-0', config.iconColor)} />
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-semibold">{t.title}</p>
              {t.description && <p className="text-xs mt-0.5 text-muted-foreground">{t.description}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
