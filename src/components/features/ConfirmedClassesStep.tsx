import { useState } from 'react';
import { useTimetableStore } from '@/stores/timetableStore';
import { generateId, cn } from '@/lib/utils';
import { toast } from '@/stores/toastStore';
import { Pin, Plus, Trash2, FlaskConical } from 'lucide-react';

export default function ConfirmedClassesStep() {
  const { branches, generalConfig, confirmedClasses, addConfirmedClass, removeConfirmedClass, subjectColors } = useTimetableStore();
  const [subjectName, setSubjectName] = useState('');
  const [shortName, setShortName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [dayIndex, setDayIndex] = useState(0);
  const [periodIndex, setPeriodIndex] = useState(0);
  const [isLab, setIsLab] = useState(false);

  function handleAdd() {
    if (!subjectName.trim() || !teacherName.trim()) { toast({ title: 'Subject name and teacher are required', variant: 'destructive' }); return; }
    if (!branchId) { toast({ title: 'Select a branch', variant: 'destructive' }); return; }
    if (isLab && periodIndex + 1 >= generalConfig.periodsPerDay) { toast({ title: 'Lab needs 2 consecutive periods', variant: 'destructive' }); return; }
    const duplicate = confirmedClasses.find((cc) => cc.branchId === branchId && cc.dayIndex === dayIndex && cc.periodIndex === periodIndex);
    if (duplicate) { toast({ title: `Slot already has "${duplicate.subjectName}"`, variant: 'destructive' }); return; }

    addConfirmedClass({
      id: generateId(), subjectName: subjectName.trim(), shortName: shortName.trim() || subjectName.trim().slice(0, 4).toUpperCase(),
      teacherName: teacherName.trim(), branchId, dayIndex, periodIndex, isLab, color: subjectColors[subjectName.trim()] || undefined,
    });
    setSubjectName(''); setShortName(''); setTeacherName(''); setIsLab(false);
    toast({ title: 'Confirmed class pinned', variant: 'success' });
  }

  const branchName = (id: string) => branches.find((b) => b.id === id)?.shortName ?? '—';

  return (
    <div className="fade-in space-y-8">
      <div className="mb-2">
        <span className="label-system text-primary mb-3 block">Step 06 — Pinned Slots</span>
        <h2 className="font-display font-bold text-2xl lg:text-3xl">
          Confirmed <span className="text-emerald-400 italic">Classes</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
          Pin specific classes to exact slots — these will never be moved by the generator (optional)
        </p>
      </div>

      <div className="surface-high rounded-2xl p-6 space-y-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Subject Name</span>
            <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="Data Structures"
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
          </label>
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Short Name</span>
            <input type="text" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="DS" maxLength={6}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body uppercase border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
          </label>
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Teacher Name</span>
            <input type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Prof. Smith"
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Branch</span>
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all">
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.shortName})</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Day</span>
            <select value={dayIndex} onChange={(e) => setDayIndex(Number(e.target.value))}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all">
              {generalConfig.workingDays.map((day, idx) => <option key={day} value={idx}>{day}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Period</span>
            <select value={periodIndex} onChange={(e) => setPeriodIndex(Number(e.target.value))}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all">
              {Array.from({ length: generalConfig.periodsPerDay }, (_, i) => <option key={i} value={i}>Period {i + 1}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer select-none surface-highest rounded-xl px-4 h-12 w-full">
              <input type="checkbox" checked={isLab} onChange={(e) => setIsLab(e.target.checked)} className="size-4 accent-secondary rounded" />
              <FlaskConical className="size-4 text-secondary" />
              <span className="text-sm font-medium">Lab (2P)</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleAdd}
            className="h-12 px-6 bg-emerald-600 text-white rounded-xl text-sm font-display font-bold flex items-center gap-2 transition-all hover:bg-emerald-500 hover:scale-[1.05] active:scale-[0.97]">
            <Plus className="size-4" /> Pin Class
          </button>
        </div>
      </div>

      {confirmedClasses.length === 0 ? (
        <div className="surface-high rounded-2xl p-12 text-center">
          <Pin className="size-8 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No confirmed classes pinned</p>
          <p className="text-xs text-muted-foreground/60 mt-1">This step is optional — skip if you want the generator to decide all placements</p>
        </div>
      ) : (
        <div className="space-y-2">
          {confirmedClasses.map((cc) => (
            <div key={cc.id} className="group flex items-center justify-between rounded-xl px-4 py-3 surface-high transition-all hover:ring-1 hover:ring-emerald-500/20">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2 py-0.5 label-system bg-emerald-500/10 text-emerald-400 rounded-lg">{cc.isLab ? 'LAB' : 'THY'}</span>
                <Pin className="size-3 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{cc.subjectName} <span className="text-muted-foreground font-display text-xs">({cc.shortName})</span></p>
                  <p className="text-xs text-muted-foreground truncate">
                    {cc.teacherName} · {branchName(cc.branchId)} · {generalConfig.workingDays[cc.dayIndex]} P{cc.periodIndex + 1}{cc.isLab && `–P${cc.periodIndex + 2}`}
                  </p>
                </div>
              </div>
              <button onClick={() => removeConfirmedClass(cc.id)} className="shrink-0 opacity-0 group-hover:opacity-100 size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
