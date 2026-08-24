import { useMemo, useState } from 'react';
import type { TimetableCell, GeneralConfig, Branch } from '@/types';
import { parseTime, formatTime, cn } from '@/lib/utils';
import EditClassDialog from './EditClassDialog';
import AssignSubjectDialog from './AssignSubjectDialog';
import { useTimetableStore } from '@/stores/timetableStore';
import { CELL_COLOR_MAP, getSubjectColorIndex } from '@/constants/config';
import { FlaskConical, Users, AlertTriangle, CheckCircle2, Pin } from 'lucide-react';

interface AllDepartmentsViewProps {
  timetables: Record<string, (TimetableCell | null)[][]>;
  branches: Branch[];
  config: GeneralConfig;

  enableDrag?: boolean;

  onSwap?: (
    sourceBranchId: string,
    sourceDay: number,
    sourcePeriod: number,
    targetBranchId: string,
    targetDay: number,
    targetPeriod: number
  ) => void;
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

export default function AllDepartmentsView({
  timetables,
  branches,
  config,
  enableDrag = false,
  onSwap,
}: AllDepartmentsViewProps) {
  const numDays = config.workingDays.length;
  const numPeriods = config.periodsPerDay;
  const timeSlots = calculateTimeSlots(config);
  const updateClass = useTimetableStore((s) => s.updateClass);
  const assignSubject = useTimetableStore((s) => s.assignSubject);
  const getRemainingSubjects = useTimetableStore((s) => s.getRemainingSubjects);
const [editing, setEditing] = useState<{
  branchId: string;
  day: number;
  period: number;
  cell: TimetableCell;
} | null>(null);

const [assigning, setAssigning] = useState<{
  branchId: string;
  day: number;
  period: number;
} | null>(null);



const [dragSource, setDragSource] = useState<{
  branchId: string;
  day: number;
  period: number;
} | null>(null);



const [dragOver, setDragOver] = useState<{
  branchId: string;
  day: number;
  period: number;
} | null>(null);
const handleDragStart = (
  branchId: string,
  day: number,
  period: number,
  e: React.DragEvent
) => {
  const cell = timetables[branchId]?.[day]?.[period];

  if (!enableDrag || !cell || cell.isConfirmed || cell.isLabContinuation) {
    e.preventDefault();
    return;
  }

  setDragSource({
    branchId,
    day,
    period,
  });

  e.dataTransfer.effectAllowed = 'move';
};

const handleDragOver = (
  branchId: string,
  day: number,
  period: number,
  e: React.DragEvent
) => {
  if (!enableDrag || !dragSource) return;

  e.preventDefault();

  setDragOver({
    branchId,
    day,
    period,
  });

  e.dataTransfer.dropEffect = 'move';
};

const handleDrop = (
  branchId: string,
  day: number,
  period: number,
  e: React.DragEvent
) => {
  e.preventDefault();

  if (!enableDrag || !dragSource || !onSwap) {
    setDragSource(null);
    setDragOver(null);
    return;
  }

  if (
    dragSource.branchId === branchId &&
    dragSource.day === day &&
    dragSource.period === period
  ) {
    setDragSource(null);
    setDragOver(null);
    return;
  }

  const targetCell = timetables[branchId]?.[day]?.[period];

  if (targetCell?.isConfirmed) {
    setDragSource(null);
    setDragOver(null);
    return;
  }

  onSwap(
    dragSource.branchId,
    dragSource.day,
    dragSource.period,
    branchId,
    day,
    period
  );

  setDragSource(null);
  setDragOver(null);
};

const handleDragEnd = () => {
  setDragSource(null);
  setDragOver(null);
};
const handleCellDoubleClick = (
  branchId: string,
  day: number,
  period: number,
  cell: TimetableCell | null
) => {
  if (cell) {
    if (cell.isConfirmed || cell.isLabContinuation) return;

    setEditing({
      branchId,
      day,
      period,
      cell,
    });

    return;
  }

  setAssigning({
    branchId,
    day,
    period,
  });
};
  const collisions = useMemo(() => {
    const issues: string[] = [];
    const teacherSlots: Record<string, { branch: string; subject: string }[]> = {};
    for (const branch of branches) {
      const grid = timetables[branch.id];
      if (!grid) continue;
      for (let d = 0; d < numDays; d++) {
        for (let p = 0; p < numPeriods; p++) {
          const cell = grid[d]?.[p];
          if (!cell || cell.isLabContinuation) continue;
          const key = `${d}-${p}-${cell.teacherName.toLowerCase().trim()}`;
          if (!teacherSlots[key]) teacherSlots[key] = [];
          teacherSlots[key].push({ branch: branch.shortName, subject: cell.subjectShortName });
        }
      }
    }
    for (const [slot, entries] of Object.entries(teacherSlots)) {
      if (entries.length > 1) {
        const [dStr, pStr] = slot.split('-');
        const d = Number(dStr); const p = Number(pStr);
        const branchList = entries.map((e) => `${e.branch}(${e.subject})`).join(', ');
        issues.push(`${config.workingDays[d]} P${p + 1}: ${branchList}`);
      }
    }
    return issues;
  }, [timetables, branches, config, numDays, numPeriods]);

  function renderMiniCell(cell: TimetableCell) {
    const colorIdx = getSubjectColorIndex(cell.subjectName);
    const color = CELL_COLOR_MAP[colorIdx] ?? CELL_COLOR_MAP[0];
    return (
      <div
  className={cn(
    'flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border-l-2',
    color.bg,
    color.border,
    cell.isConfirmed && 'ring-1 ring-emerald-500/30',
    !cell.isConfirmed && 'cursor-grab'
  )}
>
        {cell.isConfirmed && <Pin className="size-2 text-emerald-400 shrink-0" />}
        <span className={cn('text-[9px] font-display font-bold truncate', color.text)}>{cell.subjectShortName}</span>
        {cell.isLab && <FlaskConical className="size-2 text-secondary shrink-0" />}
        {cell.isCombined && <Users className="size-2 text-sky-400 shrink-0" />}
      </div>
    );
  }

  return (
    <div className="print-area space-y-5">
      {collisions.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 rounded-xl ghost-border">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span className="label-system text-emerald-400">No teacher or subject collisions detected</span>
        </div>
      ) : (
        <div className="surface-high rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="size-4 text-destructive" /><span className="label-system text-destructive">{collisions.length} Collision{collisions.length > 1 ? 's' : ''}</span></div>
          <ul className="space-y-0.5">{collisions.map((c, i) => <li key={i} className="text-[11px] text-destructive/80">• {c}</li>)}</ul>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: `${140 + numPeriods * 100}px` }}>
          <thead>
            <tr>
              <th className="surface-high px-3 py-2 text-[10px] font-display font-semibold text-muted-foreground text-left w-16 sticky left-0 z-20">Day</th>
              <th className="surface-high px-3 py-2 text-[10px] font-display font-semibold text-muted-foreground text-left w-16 sticky left-[64px] z-20">Branch</th>
              {Array.from({ length: numPeriods }).map((_, p) => {
                const cols = [];
                if (p === config.recessAfterPeriod) cols.push(<th key="r" className="bg-secondary/10 px-1 py-2 text-center w-8"><div className="text-[9px] font-display font-bold text-secondary">R</div></th>);
                cols.push(<th key={`p-${p}`} className="surface-high px-1.5 py-2 text-center min-w-[80px]"><div className="text-[10px] font-display font-semibold text-primary">P{p + 1}</div><div className="text-[8px] text-muted-foreground">{timeSlots[p]?.start}–{timeSlots[p]?.end}</div></th>);
                return cols;
              })}
            </tr>
          </thead>
          <tbody>
            {config.workingDays.map((day, d) =>
              branches.map((branch, bIdx) => (
                <tr key={`${d}-${branch.id}`}>
                  {bIdx === 0 && <td rowSpan={branches.length} className="surface-high px-3 py-1 align-middle text-[10px] font-display font-semibold sticky left-0 z-10">{day.slice(0, 3)}</td>}
                  <td className="surface-high px-2 py-1 align-middle text-[9px] font-display font-semibold text-muted-foreground text-center sticky left-[64px] z-10">{branch.shortName}</td>
                  {Array.from({ length: numPeriods }).map((_, p) => {
                    const cols = [];
                    if (p === config.recessAfterPeriod) cols.push(<td key={`r-${d}-${branch.id}`} className="bg-secondary/10 w-8" />);
                    const cell = timetables[branch.id]?.[d]?.[p] ?? null;
                    if (cell?.isLabContinuation) return cols.length > 0 ? cols : null;
                    if (cell?.isLab && !cell.isLabContinuation) {
  cols.push(
    <td
      key={`${d}-${branch.id}-${p}`}
      colSpan={2}
      className={cn(
        'p-0.5 align-middle surface-low',
        dragOver?.branchId === branch.id &&
          dragOver?.day === d &&
          dragOver?.period === p &&
          'ring-2 ring-primary'
      )}
      draggable={enableDrag && !cell.isConfirmed}
      onDragStart={(e) =>
        handleDragStart(branch.id, d, p, e)
      }
      onDragOver={(e) =>
        handleDragOver(branch.id, d, p, e)
      }
      onDrop={(e) =>
        handleDrop(branch.id, d, p, e)
      }
      onDragEnd={handleDragEnd}
      onDoubleClick={() =>
        handleCellDoubleClick(branch.id, d, p, cell)
      }
    >
      {renderMiniCell(cell)}

      <div className="text-[8px] text-muted-foreground px-1.5 truncate">
        {cell.teacherName}
      </div>
    </td>
  );

  return cols;
}

if (cell) {
  cols.push(
    <td
      key={`${d}-${branch.id}-${p}`}
      className={cn(
        'p-0.5 align-middle surface-low',
        dragOver?.branchId === branch.id &&
          dragOver?.day === d &&
          dragOver?.period === p &&
          'ring-2 ring-primary'
      )}
      draggable={enableDrag && !cell.isConfirmed}
      onDragStart={(e) =>
        handleDragStart(branch.id, d, p, e)
      }
      onDragOver={(e) =>
        handleDragOver(branch.id, d, p, e)
      }
      onDrop={(e) =>
        handleDrop(branch.id, d, p, e)
      }
      onDragEnd={handleDragEnd}
      onDoubleClick={() =>
        handleCellDoubleClick(branch.id, d, p, cell)
      }
    >
      {renderMiniCell(cell)}

      <div className="text-[8px] text-muted-foreground px-1.5 truncate">
        {cell.teacherName}
      </div>
    </td>
  );

  return cols;
}

cols.push(
  <td
    key={`${d}-${branch.id}-${p}`}
    className={cn(
      'p-0.5 align-middle surface-low',
      dragOver?.branchId === branch.id &&
        dragOver?.day === d &&
        dragOver?.period === p &&
        'ring-2 ring-primary'
    )}
    onDragOver={(e) =>
      handleDragOver(branch.id, d, p, e)
    }
    onDrop={(e) =>
      handleDrop(branch.id, d, p, e)
    }
    onDoubleClick={() =>
      handleCellDoubleClick(branch.id, d, p, null)
    }
  >
    <div className="min-h-[28px] flex items-center justify-center">
      <span className="text-[9px] text-muted-foreground/20">
        —
      </span>
    </div>
  </td>
);

return cols;
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
