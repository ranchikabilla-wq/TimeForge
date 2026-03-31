import { useState } from 'react';
import { useTimetableStore } from '@/stores/timetableStore';
import { generateId, cn } from '@/lib/utils';
import { toast } from '@/stores/toastStore';
import { Users, FlaskConical, Plus, Trash2 } from 'lucide-react';

export default function CombinedClassStep() {
  const { branches, combinedClasses, addCombinedClass, removeCombinedClass } = useTimetableStore();
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [isLab, setIsLab] = useState(false);
  const [lectures, setLectures] = useState(3);

  function toggleBranch(id: string) {
    setSelectedBranches((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  }

  function handleAdd() {
    if (!name.trim() || !teacher.trim()) { toast({ title: 'Subject name and teacher required', variant: 'destructive' }); return; }
    if (selectedBranches.length < 2) { toast({ title: 'Select at least 2 branches', variant: 'destructive' }); return; }
    if (isLab && lectures % 2 !== 0) { toast({ title: 'Lab lectures/week must be even', variant: 'destructive' }); return; }

    addCombinedClass({
      id: generateId(), subjectName: name.trim(), shortName: shortName.trim() || name.trim().slice(0, 4).toUpperCase(),
      teacherName: teacher.trim(), branchIds: selectedBranches, isLab, lecturesPerWeek: lectures,
    });
    setName(''); setShortName(''); setTeacher(''); setSelectedBranches([]); setIsLab(false); setLectures(3);
    toast({ title: 'Combined class added', variant: 'success' });
  }

  return (
    <div className="fade-in space-y-8">
      <div className="mb-2">
        <span className="label-system text-primary mb-3 block">Step 05 — Fusion Classes</span>
        <h2 className="font-display font-bold text-2xl lg:text-3xl">
          Combined <span className="text-secondary italic">Classes</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
          Subjects taught to multiple branches simultaneously (optional)
        </p>
      </div>

      <div className="surface-high rounded-2xl p-6 space-y-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Subject Name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Engineering Math"
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
          </label>
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Short Name</span>
            <input type="text" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="EM" maxLength={6}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body uppercase border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
          </label>
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Teacher</span>
            <input type="text" value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="Prof. Johnson"
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
          </label>
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Lectures / Week</span>
            <input type="number" min={1} max={10} value={lectures} onChange={(e) => setLectures(Number(e.target.value))}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
          </label>
        </div>

        <div>
          <span className="label-system text-muted-foreground mb-3 block">Select Branches (min 2)</span>
          <div className="flex flex-wrap gap-2">
            {branches.map((b) => (
              <button key={b.id} onClick={() => toggleBranch(b.id)}
                className={cn('px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all',
                  selectedBranches.includes(b.id) ? 'bg-secondary/15 text-secondary glow-secondary' : 'surface-highest text-muted-foreground hover:text-foreground')}>
                {b.shortName}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer select-none surface-highest rounded-xl px-4 py-2.5">
            <input type="checkbox" checked={isLab} onChange={(e) => setIsLab(e.target.checked)} className="size-4 accent-secondary rounded" />
            <FlaskConical className="size-4 text-secondary" />
            <span className="text-sm font-medium">Lab Subject</span>
          </label>
          <button onClick={handleAdd} className="h-12 px-6 bg-secondary text-secondary-foreground rounded-xl text-sm font-display font-bold flex items-center gap-2 btn-secondary-bubble">
            <Plus className="size-4" /> Add Combined
          </button>
        </div>
      </div>

      {combinedClasses.length === 0 ? (
        <div className="surface-high rounded-2xl p-12 text-center">
          <Users className="size-8 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No combined classes added</p>
          <p className="text-xs text-muted-foreground/60 mt-1">This step is optional — skip if not needed</p>
        </div>
      ) : (
        <div className="space-y-2">
          {combinedClasses.map((cc) => (
            <div key={cc.id} className="group flex items-center justify-between rounded-xl px-4 py-3 surface-high transition-all hover:glow-secondary">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2 py-0.5 label-system bg-secondary/10 text-secondary rounded-lg">{cc.isLab ? 'LAB' : 'CMB'}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{cc.subjectName} <span className="text-muted-foreground font-display text-xs">({cc.shortName})</span></p>
                  <p className="text-xs text-muted-foreground truncate">
                    {cc.teacherName} · {cc.lecturesPerWeek} lec/wk · {cc.branchIds.map((bid) => branches.find((b) => b.id === bid)?.shortName).join(' + ')}
                  </p>
                </div>
              </div>
              <button onClick={() => removeCombinedClass(cc.id)} className="shrink-0 opacity-0 group-hover:opacity-100 size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
