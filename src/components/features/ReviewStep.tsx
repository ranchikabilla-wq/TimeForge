import { useTimetableStore } from '@/stores/timetableStore';
import { CheckCircle2, GitBranch, BookOpen, Users, Settings, FlaskConical, Pin } from 'lucide-react';

export default function ReviewStep() {
  const { generalConfig, branches, subjects, combinedClasses, confirmedClasses, labRooms, subjectColors } = useTimetableStore();

  const totalTheory = subjects.reduce((sum, s) => {
    const bc = s.branchIds?.length || 1;
    return sum + ((s.mode === 'theory' || s.mode === 'both') ? (s.theoryPerWeek ?? 0) * bc : 0);
  }, 0);
  const totalPractical = subjects.reduce((sum, s) => {
    const bc = s.branchIds?.length || 1;
    return sum + ((s.mode === 'practical' || s.mode === 'both') ? (s.practicalPerWeek ?? 0) * bc : 0);
  }, 0);
  const totalCombined = combinedClasses.reduce((sum, cc) => sum + cc.lecturesPerWeek * cc.branchIds.length, 0);
  const totalLectures = totalTheory + totalPractical + totalCombined;

  return (
    <div className="fade-in space-y-8">
      <div className="mb-2">
        <span className="label-system text-primary mb-3 block">Step 07 — Final Review</span>
        <h2 className="font-display font-bold text-2xl lg:text-3xl">
          Review & <span className="text-emerald-400 italic">Generate</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">Verify your inputs before forging the timetable</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="surface-high rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><Settings className="size-4 text-primary" /><span className="label-system text-primary">Configuration</span></div>
          <div className="space-y-1.5 text-sm">
            <p><span className="text-muted-foreground">Periods:</span> {generalConfig.periodsPerDay}/day</p>
            <p><span className="text-muted-foreground">Duration:</span> {generalConfig.periodDuration} min</p>
            <p><span className="text-muted-foreground">Start:</span> {generalConfig.startTime}</p>
            <p><span className="text-muted-foreground">Recess after:</span> Period {generalConfig.recessAfterPeriod}</p>
            <p><span className="text-muted-foreground">Days:</span> {generalConfig.workingDays.length}</p>
          </div>
        </div>

        <div className="surface-high rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><GitBranch className="size-4 text-primary" /><span className="label-system text-primary">{branches.length} Branch{branches.length !== 1 && 'es'}</span></div>
          <div className="flex flex-wrap gap-1.5">
            {branches.map((b) => (
              <span key={b.id} className="px-2 py-1 label-system bg-primary/10 text-primary rounded-lg">{b.shortName}</span>
            ))}
          </div>
        </div>

        <div className="surface-high rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><FlaskConical className="size-4 text-secondary" /><span className="label-system text-secondary">{labRooms.length} Lab Room{labRooms.length !== 1 && 's'}</span></div>
          {labRooms.length === 0 ? <p className="text-xs text-muted-foreground">No lab rooms defined</p> : (
            <div className="space-y-1 text-sm">{labRooms.map((l) => <p key={l.id} className="truncate"><span className="text-muted-foreground">{l.shortName}:</span> {l.labType} ({l.capacity})</p>)}</div>
          )}
        </div>

        <div className="surface-high rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><BookOpen className="size-4 text-primary" /><span className="label-system text-primary">{subjects.length} Subject{subjects.length !== 1 && 's'}</span></div>
          <div className="space-y-1 text-sm">
            {subjects.slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-center gap-1.5">
                {subjectColors[s.name] && <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: subjectColors[s.name] }} />}
                <p className="truncate"><span className="text-muted-foreground">{s.shortName}:</span> {s.mode === 'both' ? 'T+P' : s.mode === 'theory' ? 'Theory' : 'Practical'}</p>
              </div>
            ))}
            {subjects.length > 6 && <p className="text-muted-foreground/60">+{subjects.length - 6} more</p>}
          </div>
        </div>

        <div className="surface-high rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><Users className="size-4 text-secondary" /><span className="label-system text-secondary">{combinedClasses.length} Combined</span></div>
          {combinedClasses.length === 0 ? <p className="text-xs text-muted-foreground">None</p> : (
            <div className="space-y-1 text-sm">{combinedClasses.map((cc) => <p key={cc.id} className="truncate"><span className="text-muted-foreground">{cc.shortName}:</span> {cc.branchIds.map((bid) => branches.find((b) => b.id === bid)?.shortName).join('+')}</p>)}</div>
          )}
        </div>

        <div className="surface-high rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><Pin className="size-4 text-emerald-400" /><span className="label-system text-emerald-400">{confirmedClasses.length} Confirmed</span></div>
          {confirmedClasses.length === 0 ? <p className="text-xs text-muted-foreground">No pinned classes</p> : (
            <div className="space-y-1 text-sm">
              {confirmedClasses.slice(0, 5).map((cc) => <p key={cc.id} className="truncate"><span className="text-muted-foreground">{cc.shortName}:</span> {branches.find((b) => b.id === cc.branchId)?.shortName} · {generalConfig.workingDays[cc.dayIndex]?.slice(0, 3)} P{cc.periodIndex + 1}</p>)}
              {confirmedClasses.length > 5 && <p className="text-muted-foreground/60">+{confirmedClasses.length - 5} more</p>}
            </div>
          )}
        </div>
      </div>

      <div className="surface-high rounded-2xl p-6 flex flex-wrap gap-8">
        <div><p className="text-3xl font-display font-bold text-primary tabular-nums">{totalLectures}</p><p className="label-system text-muted-foreground">Total/Week</p></div>
        <div><p className="text-3xl font-display font-bold tabular-nums">{totalTheory}</p><p className="label-system text-muted-foreground">Theory</p></div>
        <div><p className="text-3xl font-display font-bold text-secondary tabular-nums">{totalPractical}</p><p className="label-system text-muted-foreground">Practical</p></div>
        <div><p className="text-3xl font-display font-bold text-emerald-400 tabular-nums">{confirmedClasses.length}</p><p className="label-system text-muted-foreground">Pinned</p></div>
        <div><p className="text-3xl font-display font-bold tabular-nums">{generalConfig.workingDays.length * generalConfig.periodsPerDay}</p><p className="label-system text-muted-foreground">Slots/Branch</p></div>
        <div><p className="text-3xl font-display font-bold tabular-nums">{new Set([...subjects.map((s) => s.teacherName.toLowerCase().trim()), ...combinedClasses.map((c) => c.teacherName.toLowerCase().trim())]).size}</p><p className="label-system text-muted-foreground">Teachers</p></div>
      </div>
    </div>
  );
}
