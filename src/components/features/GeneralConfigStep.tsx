import { useTimetableStore } from '@/stores/timetableStore';
import { ALL_DAYS } from '@/constants/config';
import { Settings, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GeneralConfigStep() {
  const { generalConfig, setGeneralConfig } = useTimetableStore();

  function update(partial: Partial<typeof generalConfig>) {
    setGeneralConfig({ ...generalConfig, ...partial });
  }

  function toggleDay(day: string) {
    const days = generalConfig.workingDays.includes(day)
      ? generalConfig.workingDays.filter((d) => d !== day)
      : [...generalConfig.workingDays, day];
    update({ workingDays: days });
  }

  return (
    <div className="fade-in space-y-8">
      <div className="mb-2">
        <span className="label-system text-primary mb-3 block">Step 01 — System Core</span>
        <h2 className="font-display font-bold text-2xl lg:text-3xl">
          General <span className="text-primary italic">Configuration</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
          Define the fundamental temporal structure of your institution. These parameters will serve as the architectural foundation for the kinetic forging process.
        </p>
      </div>

      <div className="surface-high rounded-2xl p-6 space-y-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Periods Per Day</span>
            <input
              type="number"
              min={1}
              max={12}
              value={generalConfig.periodsPerDay}
              onChange={(e) => update({ periodsPerDay: Number(e.target.value) })}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </label>

          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Period Duration (Min)</span>
            <input
              type="number"
              min={20}
              max={120}
              value={generalConfig.periodDuration}
              onChange={(e) => update({ periodDuration: Number(e.target.value) })}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </label>

          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block flex items-center gap-2">
              <Clock className="size-3" /> Start Time
            </span>
            <input
              type="time"
              value={generalConfig.startTime}
              onChange={(e) => update({ startTime: e.target.value })}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </label>

          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Recess After Period</span>
            <input
              type="number"
              min={1}
              max={generalConfig.periodsPerDay}
              value={generalConfig.recessAfterPeriod}
              onChange={(e) => update({ recessAfterPeriod: Number(e.target.value) })}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </label>

          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Recess Duration (Min)</span>
            <input
              type="number"
              min={5}
              max={60}
              value={generalConfig.recessDuration}
              onChange={(e) => update({ recessDuration: Number(e.target.value) })}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </label>
        </div>

        <div>
          <span className="label-system text-muted-foreground mb-3 block">Active Working Days</span>
          <div className="flex flex-wrap gap-3">
            {ALL_DAYS.map((day) => {
              const active = generalConfig.workingDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    'relative px-5 py-3 rounded-xl font-display font-semibold text-sm transition-all min-w-[72px]',
                    active
                      ? 'bg-primary/15 text-primary glow-primary'
                      : 'surface-highest text-muted-foreground hover:text-foreground'
                  )}
                >
                  {day.slice(0, 3).toUpperCase()}
                  {active && (
                    <CheckCircle2 className="size-4 text-primary absolute -top-1 -right-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
