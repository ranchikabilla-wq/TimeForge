import { useMemo } from 'react';
import type { TimetableCell, GeneralConfig, Branch, LabRoom } from '@/types';
import { parseTime, formatTime, cn } from '@/lib/utils';
import { CELL_COLOR_MAP, getSubjectColorIndex } from '@/constants/config';
import { FlaskConical, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LabViewProps {
  timetables: Record<string, (TimetableCell | null)[][]>;
  branches: Branch[];
  config: GeneralConfig;
  labRooms: LabRoom[];
}

function calculateTimeSlots(config: GeneralConfig) {
  const slots: { start: string; end: string }[] = [];
  let currentMinutes = parseTime(config.startTime);
  for (let p = 0; p < config.periodsPerDay; p++) {
    if (p === config.recessAfterPeriod) currentMinutes += config.recessDuration;
    const start = formatTime(currentMinutes);
    currentMinutes += config.periodDuration;
    slots.push({ start, end: formatTime(currentMinutes) });
  }
  return slots;
}

interface LabSlot { day: number; period: number; branch: Branch; cell: TimetableCell; }

export default function LabView({ timetables, branches, config, labRooms }: LabViewProps) {
  const numDays = config.workingDays.length;
  const numPeriods = config.periodsPerDay;
  const timeSlots = calculateTimeSlots(config);

  const labSchedule = useMemo(() => {
    const schedule: Record<string, LabSlot[]> = {};
    const unassigned: LabSlot[] = [];
    for (const branch of branches) {
      const grid = timetables[branch.id];
      if (!grid) continue;
      for (let d = 0; d < numDays; d++) {
        for (let p = 0; p < numPeriods; p++) {
          const cell = grid[d]?.[p];
          if (!cell || !cell.isLab || cell.isLabContinuation) continue;
          const slot: LabSlot = { day: d, period: p, branch, cell };
          if (cell.labRoomShortName) { const key = cell.labRoomShortName; if (!schedule[key]) schedule[key] = []; schedule[key].push(slot); }
          else unassigned.push(slot);
        }
      }
    }
    return { assigned: schedule, unassigned };
  }, [timetables, branches, numDays, numPeriods]);

  const conflicts = useMemo(() => {
    const issues: string[] = [];
    for (const [labName, slots] of Object.entries(labSchedule.assigned)) {
      const occupied: Record<string, LabSlot[]> = {};
      for (const slot of slots) {
        const key = `${slot.day}-${slot.period}`;
        if (!occupied[key]) occupied[key] = []; occupied[key].push(slot);
        const contKey = `${slot.day}-${slot.period + 1}`;
        if (!occupied[contKey]) occupied[contKey] = []; occupied[contKey].push(slot);
      }
      for (const [slotKey, entries] of Object.entries(occupied)) {
        if (entries.length > 1) {
          const [d, p] = slotKey.split('-').map(Number);
          issues.push(`${labName}: ${config.workingDays[d]} P${p + 1} — ${entries.map((e) => e.branch.shortName).join(', ')}`);
        }
      }
    }
    return [...new Set(issues)];
  }, [labSchedule, config]);

  const allLabRoomNames = [...Object.keys(labSchedule.assigned), ...(labSchedule.unassigned.length > 0 ? ['Unassigned'] : [])];

  return (
    <div className="print-area space-y-5">
      {conflicts.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 rounded-xl ghost-border">
          <CheckCircle2 className="size-4 text-emerald-400" /><span className="label-system text-emerald-400">No lab room conflicts</span>
        </div>
      ) : (
        <div className="surface-high rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="size-4 text-destructive" /><span className="label-system text-destructive">{conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''}</span></div>
          <ul className="space-y-0.5">{conflicts.map((c, i) => <li key={i} className="text-[11px] text-destructive/80">• {c}</li>)}</ul>
        </div>
      )}

      {labRooms.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {labRooms.map((lab) => {
            const slots = labSchedule.assigned[lab.shortName] ?? [];
            const utilization = numDays > 0 ? Math.round((slots.length * 2 / (numDays * numPeriods)) * 100) : 0;
            return (
              <div key={lab.id} className="surface-high rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1"><FlaskConical className="size-3.5 text-secondary" /><span className="text-sm font-display font-bold">{lab.name}</span></div>
                <p className="label-system text-muted-foreground">{lab.labType} · {lab.capacity} seats</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 surface-highest rounded-full overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: `${Math.min(utilization, 100)}%` }} /></div>
                  <span className="label-system text-secondary tabular-nums">{utilization}%</span>
                </div>
                <p className="label-system text-muted-foreground mt-1">{slots.length} sessions/week</p>
              </div>
            );
          })}
        </div>
      )}

      {allLabRoomNames.map((labName) => {
        const slots = labName === 'Unassigned' ? labSchedule.unassigned : (labSchedule.assigned[labName] ?? []);
        if (slots.length === 0) return null;
        const grid: Record<number, Record<number, LabSlot>> = {};
        for (const s of slots) { if (!grid[s.day]) grid[s.day] = {}; grid[s.day][s.period] = s; }

        return (
          <div key={labName} className="surface-high rounded-2xl p-5">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <FlaskConical className="size-4 text-secondary" /> {labName}
              <span className="label-system text-muted-foreground font-normal">({slots.length} sessions)</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[500px]">
                <thead>
                  <tr>
                    <th className="surface-highest px-3 py-2 text-[10px] font-display font-semibold text-muted-foreground text-left w-20 rounded-tl-xl">Day</th>
                    {Array.from({ length: numPeriods }).map((_, p) => (
                      <th key={p} className="surface-highest px-2 py-2 text-center"><div className="text-[10px] font-display font-semibold text-primary">P{p + 1}</div><div className="text-[8px] text-muted-foreground">{timeSlots[p]?.start}–{timeSlots[p]?.end}</div></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {config.workingDays.map((day, d) => (
                    <tr key={day}>
                      <td className="surface-highest px-3 py-1 text-[10px] font-display font-semibold">{day.slice(0, 3)}</td>
                      {Array.from({ length: numPeriods }).map((_, p) => {
                        const slot = grid[d]?.[p];
                        const prevSlot = grid[d]?.[p - 1];
                        if (prevSlot) return null;
                        if (slot) {
                          const colorIdx = getSubjectColorIndex(slot.cell.subjectName);
                          const color = CELL_COLOR_MAP[colorIdx] ?? CELL_COLOR_MAP[0];
                          return <td key={p} colSpan={2} className={cn('p-1 align-middle', color.bg, 'rounded-lg')}><div className="flex items-center gap-1"><span className={cn('text-[10px] font-display font-bold', color.text)}>{slot.cell.subjectShortName}</span></div><div className="text-[9px] text-muted-foreground">{slot.cell.teacherName}</div><div className="label-system text-primary/60">{slot.branch.shortName}</div></td>;
                        }
                        return <td key={p} className="p-1 align-middle surface-low"><div className="min-h-[32px] flex items-center justify-center"><span className="text-[9px] text-muted-foreground/20">—</span></div></td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {allLabRoomNames.length === 0 && (
        <div className="surface-high rounded-2xl p-12 text-center">
          <FlaskConical className="size-8 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No lab sessions in the generated timetable</p>
        </div>
      )}
    </div>
  );
}
