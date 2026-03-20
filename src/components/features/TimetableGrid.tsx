import type { TimetableCell, GeneralConfig } from '@/types';
import { parseTime, formatTime, cn } from '@/lib/utils';
import { CELL_COLOR_MAP, getSubjectColorIndex } from '@/constants/config';
import { FlaskConical, Users, GripVertical, Pin } from 'lucide-react';
import { useState, useCallback } from 'react';

interface TimetableGridProps {
  grid: (TimetableCell | null)[][];
  config: GeneralConfig;
  branchName: string;
  branchId?: string;
  enableDrag?: boolean;
  onSwap?: (day1: number, period1: number, day2: number, period2: number) => void;
  compact?: boolean;
}

type RenderInstruction =
  | { type: 'normal'; cell: TimetableCell }
  | { type: 'lab-start'; cell: TimetableCell }
  | { type: 'lab-continuation' }
  | { type: 'empty' };

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

function getRecessTime(config: GeneralConfig) {
  let currentMinutes = parseTime(config.startTime);
  for (let p = 0; p < config.recessAfterPeriod; p++) currentMinutes += config.periodDuration;
  return { start: formatTime(currentMinutes), end: formatTime(currentMinutes + config.recessDuration) };
}

export default function TimetableGrid({ grid, config, branchName, branchId, enableDrag = false, onSwap, compact = false }: TimetableGridProps) {
  const numDays = config.workingDays.length;
  const numPeriods = config.periodsPerDay;
  const timeSlots = calculateTimeSlots(config);
  const recess = getRecessTime(config);

  const [dragSource, setDragSource] = useState<{ day: number; period: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ day: number; period: number } | null>(null);

  const instructions: RenderInstruction[][] = [];
  for (let d = 0; d < numDays; d++) {
    instructions[d] = [];
    for (let p = 0; p < numPeriods; p++) {
      const cell = grid[d]?.[p] ?? null;
      if (!cell) instructions[d][p] = { type: 'empty' };
      else if (cell.isLab && !cell.isLabContinuation) instructions[d][p] = { type: 'lab-start', cell };
      else if (cell.isLabContinuation) instructions[d][p] = { type: 'lab-continuation' };
      else instructions[d][p] = { type: 'normal', cell };
    }
  }

  const handleDragStart = useCallback((day: number, period: number, e: React.DragEvent) => {
    if (!enableDrag) return;
    const cell = grid[day]?.[period];
    if (cell?.isConfirmed) { e.preventDefault(); return; }
    setDragSource({ day, period });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ branchId, dayIndex: day, periodIndex: period }));
  }, [enableDrag, branchId, grid]);

  const handleDragOver = useCallback((day: number, period: number, e: React.DragEvent) => {
    if (!enableDrag) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver({ day, period });
  }, [enableDrag]);

  const handleDragLeave = useCallback(() => setDragOver(null), []);

  const handleDrop = useCallback((day: number, period: number, e: React.DragEvent) => {
    e.preventDefault();
    if (!enableDrag || !dragSource || !onSwap) return;
    const targetCell = grid[day]?.[period];
    if (targetCell?.isConfirmed) { setDragSource(null); setDragOver(null); return; }
    if (dragSource.day === day && dragSource.period === period) { setDragSource(null); setDragOver(null); return; }
    onSwap(dragSource.day, dragSource.period, day, period);
    setDragSource(null); setDragOver(null);
  }, [enableDrag, dragSource, onSwap, grid]);

  const handleDragEnd = useCallback(() => { setDragSource(null); setDragOver(null); }, []);

  function renderCell(cell: TimetableCell, isLabSpan: boolean) {
    const hasCustomColor = !!cell.color;
    const colorIdx = getSubjectColorIndex(cell.subjectName);
    const color = CELL_COLOR_MAP[colorIdx] ?? CELL_COLOR_MAP[0];
    const bgStyle = hasCustomColor ? { backgroundColor: `${cell.color}22`, borderLeftColor: cell.color } : {};
    const textStyle = hasCustomColor ? { color: cell.color } : {};

    return (
      <div className={cn('h-full flex flex-col justify-center rounded-xl border-l-2', compact ? 'px-2 py-1' : 'px-3 py-2',
        !hasCustomColor && color.bg, !hasCustomColor && color.border, cell.isConfirmed && 'ring-1 ring-emerald-500/40')} style={bgStyle}>
        <div className="flex items-center gap-1">
          {enableDrag && !cell.isConfirmed && <GripVertical className="size-3 text-muted-foreground/50 shrink-0 cursor-grab" />}
          {cell.isConfirmed && <Pin className="size-2.5 text-emerald-400 shrink-0" />}
          <span className={cn('font-display font-bold truncate', compact ? 'text-[10px]' : 'text-xs', !hasCustomColor && color.text)} style={textStyle}>{cell.subjectShortName}</span>
          {cell.isLab && <FlaskConical className="size-3 text-secondary shrink-0" />}
          {cell.isCombined && <Users className="size-3 text-sky-400 shrink-0" />}
        </div>
        <span className={cn('text-muted-foreground truncate', compact ? 'text-[9px]' : 'text-[10px]')}>{cell.teacherName}</span>
        {cell.labRoomShortName && !compact && <span className="text-[9px] text-secondary/70 font-display truncate">🧪 {cell.labRoomShortName}</span>}
        {cell.isCombined && cell.combinedBranches.length > 0 && !compact && <span className="text-[9px] text-sky-400/70 truncate">{cell.combinedBranches.join('+')}</span>}
        {cell.branchShortName && !compact && <span className="text-[9px] text-primary/60 font-display truncate">{cell.branchShortName}</span>}
        {isLabSpan && !compact && <span className="text-[9px] text-secondary/60 font-display">2 Periods</span>}
      </div>
    );
  }

  const isDragTarget = (d: number, p: number) => dragOver?.day === d && dragOver?.period === p;
  const isDragSourceCell = (d: number, p: number) => dragSource?.day === d && dragSource?.period === p;

  return (
    <div className="print-area">
      <div className="text-center mb-3 hidden print:block"><h2 className="font-display font-bold text-xl">{branchName} — Timetable</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr>
              <th className={cn('surface-high text-xs font-display font-semibold text-muted-foreground text-left rounded-tl-xl', compact ? 'px-2 py-2 w-20' : 'px-4 py-3 w-28')}>Day / Period</th>
              {Array.from({ length: numPeriods }).map((_, p) => {
                const cols = [];
                if (p === config.recessAfterPeriod) {
                  cols.push(<th key="recess-col" className="bg-secondary/10 px-1 py-2 text-center w-10"><div className="text-[10px] font-display font-bold text-secondary">R</div><div className="text-[8px] text-secondary/60">{recess.start}–{recess.end}</div></th>);
                }
                cols.push(<th key={`p-${p}`} className={cn('surface-high text-center', compact ? 'px-2 py-2' : 'px-3 py-3')}><div className={cn('font-display font-semibold text-primary', compact ? 'text-[10px]' : 'text-xs')}>P{p + 1}</div><div className={cn('text-muted-foreground tabular-nums', compact ? 'text-[8px]' : 'text-[10px]')}>{timeSlots[p]?.start}–{timeSlots[p]?.end}</div></th>);
                return cols;
              })}
            </tr>
          </thead>
          <tbody>
            {config.workingDays.map((day, d) => (
              <tr key={day}>
                <td className={cn('surface-high align-middle', compact ? 'px-2 py-2' : 'px-4 py-3')}><span className={cn('font-display font-semibold', compact ? 'text-[10px]' : 'text-xs')}>{compact ? day.slice(0, 3) : day}</span></td>
                {Array.from({ length: numPeriods }).map((_, p) => {
                  const cols: React.ReactNode[] = [];
                  if (p === config.recessAfterPeriod) cols.push(<td key={`recess-${d}`} className="bg-secondary/10 px-1 py-1 text-center w-10" />);
                  const inst = instructions[d]?.[p];
                  if (!inst || inst.type === 'lab-continuation') {
                    if (inst?.type === 'lab-continuation') return cols.length > 0 ? cols : null;
                    cols.push(<td key={`${d}-${p}`} className={cn('p-1 align-middle surface-low transition-all', isDragTarget(d, p) && 'ring-2 ring-primary ring-inset bg-primary/10')}
                      {...(enableDrag ? { onDragOver: (e: React.DragEvent) => handleDragOver(d, p, e), onDragLeave: handleDragLeave, onDrop: (e: React.DragEvent) => handleDrop(d, p, e) } : {})}>
                      <div className="h-full min-h-[40px] flex items-center justify-center"><span className="text-[10px] text-muted-foreground/20">—</span></div></td>);
                    return cols;
                  }
                  const isDragging = isDragSourceCell(d, p);
                  const isTarget = isDragTarget(d, p);
                  const isConfirmed = (inst.type === 'normal' || inst.type === 'lab-start') && inst.cell.isConfirmed;
                  const dragProps = enableDrag && inst.type !== 'empty' && !isConfirmed ? { draggable: true, onDragStart: (e: React.DragEvent) => handleDragStart(d, p, e), onDragEnd: handleDragEnd } : {};
                  const dropProps = enableDrag ? { onDragOver: (e: React.DragEvent) => handleDragOver(d, p, e), onDragLeave: handleDragLeave, onDrop: (e: React.DragEvent) => handleDrop(d, p, e) } : {};

                  if (inst.type === 'lab-start') {
                    cols.push(<td key={`${d}-${p}`} colSpan={2} className={cn('p-1 align-middle surface-low print-cell-lab transition-all', isDragging && 'opacity-40 scale-95', isTarget && 'ring-2 ring-primary ring-inset bg-primary/10', enableDrag && !isConfirmed && 'cursor-grab active:cursor-grabbing', isConfirmed && 'cursor-not-allowed')} {...dragProps} {...dropProps}>{renderCell(inst.cell, true)}</td>);
                    return cols;
                  }
                  if (inst.type === 'normal') {
                    cols.push(<td key={`${d}-${p}`} className={cn('p-1 align-middle surface-low print-cell-normal transition-all', isDragging && 'opacity-40 scale-95', isTarget && 'ring-2 ring-primary ring-inset bg-primary/10', enableDrag && !isConfirmed && 'cursor-grab active:cursor-grabbing', isConfirmed && 'cursor-not-allowed')} {...dragProps} {...dropProps}>{renderCell(inst.cell, false)}</td>);
                    return cols;
                  }
                  cols.push(<td key={`${d}-${p}`} className={cn('p-1 align-middle surface-low transition-all', isTarget && 'ring-2 ring-primary ring-inset bg-primary/10')} {...dropProps}><div className="h-full min-h-[40px] flex items-center justify-center"><span className="text-[10px] text-muted-foreground/20">—</span></div></td>);
                  return cols;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
