import { useState } from 'react';
import { useTimetableStore } from '@/stores/timetableStore';
import { generateId, cn } from '@/lib/utils';
import { toast } from '@/stores/toastStore';
import { BookOpen, FlaskConical, Plus, Trash2, Pencil, Check, X, Palette } from 'lucide-react';
import type { SubjectMode, LabType } from '@/types';
import { LAB_TYPES, SUBJECT_PALETTE } from '@/types';

export default function SubjectsStep() {
  const { branches, subjects, addSubject, removeSubject, updateSubject, labRooms, subjectColors, setSubjectColor } = useTimetableStore();
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [mode, setMode] = useState<SubjectMode>('theory');
  const [theoryPerWeek, setTheoryPerWeek] = useState(3);
  const [practicalPerWeek, setPracticalPerWeek] = useState(2);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [preferredLabType, setPreferredLabType] = useState<LabType>('Computer Lab');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState('#5ffff7');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ name: string; shortName: string; teacherName: string; theoryPerWeek: number; practicalPerWeek: number }>({ name: '', shortName: '', teacherName: '', theoryPerWeek: 3, practicalPerWeek: 2 });

  function toggleBranch(id: string) {
    setSelectedBranches((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  function handleAdd() {
    if (!name.trim() || !teacher.trim()) {
      toast({ title: 'Subject name and teacher are required', variant: 'destructive' });
      return;
    }
    if (selectedBranches.length === 0) {
      toast({ title: 'Select at least one branch', variant: 'destructive' });
      return;
    }
    if ((mode === 'practical' || mode === 'both') && practicalPerWeek % 2 !== 0) {
      toast({ title: 'Practical lectures/week must be even (each lab = 2 periods)', variant: 'destructive' });
      return;
    }

    addSubject({
      id: generateId(),
      name: name.trim(),
      shortName: shortName.trim() || name.trim().slice(0, 4).toUpperCase(),
      teacherName: teacher.trim(),
      branchIds: selectedBranches,
      mode,
      theoryPerWeek: mode === 'practical' ? 0 : theoryPerWeek,
      practicalPerWeek: mode === 'theory' ? 0 : practicalPerWeek,
      preferredLabType: mode !== 'theory' ? preferredLabType : undefined,
      color: subjectColors[name.trim()] || undefined,
    });

    setName('');
    setShortName('');
    setTeacher('');
    setSelectedBranches([]);
    setMode('theory');
    setTheoryPerWeek(3);
    setPracticalPerWeek(2);
    toast({ title: 'Subject added', variant: 'success' });
  }

  function startEdit(s: typeof subjects[0]) {
    setEditingId(s.id);
    setEditData({ name: s.name, shortName: s.shortName, teacherName: s.teacherName, theoryPerWeek: s.theoryPerWeek, practicalPerWeek: s.practicalPerWeek });
  }

  function saveEdit() {
    if (!editingId || !editData.name.trim()) return;
    updateSubject(editingId, { name: editData.name.trim(), shortName: editData.shortName.trim(), teacherName: editData.teacherName.trim(), theoryPerWeek: editData.theoryPerWeek, practicalPerWeek: editData.practicalPerWeek });
    setEditingId(null);
    toast({ title: 'Subject updated', variant: 'success' });
  }

  return (
    <div className="fade-in space-y-8">
      <div className="mb-2">
        <span className="label-system text-primary mb-3 block">Step 04 — Knowledge Base</span>
        <h2 className="font-display font-bold text-2xl lg:text-3xl">
          Subjects & <span className="text-primary italic">Teachers</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
          Add subjects once, assign to multiple branches. Choose theory, practical, or both.
        </p>
      </div>

      {/* Add form */}
      <div className="surface-high rounded-2xl p-6 space-y-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Subject Name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Data Structures"
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
          </label>
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Short Name</span>
            <input type="text" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="DS" maxLength={6}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body uppercase border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
          </label>
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Teacher Name</span>
            <input type="text" value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="Prof. Smith"
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
          </label>
        </div>

        {/* Mode selector */}
        <div>
          <span className="label-system text-muted-foreground mb-3 block">Subject Type</span>
          <div className="flex gap-3">
            {(['theory', 'practical', 'both'] as SubjectMode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={cn('px-5 py-3 rounded-xl text-sm font-display font-semibold transition-all',
                  mode === m ? m === 'practical' ? 'bg-secondary/15 text-secondary glow-secondary' : m === 'both' ? 'bg-violet-500/15 text-violet-300' : 'bg-primary/15 text-primary glow-primary' : 'surface-highest text-muted-foreground hover:text-foreground')}>
                {m === 'theory' && 'Theory Only'}
                {m === 'practical' && 'Practical Only'}
                {m === 'both' && 'Theory + Practical'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(mode === 'theory' || mode === 'both') && (
            <label className="block">
              <span className="label-system text-muted-foreground mb-2 block">Theory Lectures / Week</span>
              <input type="number" min={1} max={12} value={theoryPerWeek} onChange={(e) => setTheoryPerWeek(Number(e.target.value))}
                className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
            </label>
          )}
          {(mode === 'practical' || mode === 'both') && (
            <>
              <label className="block">
                <span className="label-system text-muted-foreground mb-2 block">Practical / Week <span className="text-secondary">(even)</span></span>
                <input type="number" min={2} max={12} step={2} value={practicalPerWeek} onChange={(e) => setPracticalPerWeek(Number(e.target.value))}
                  className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all" />
              </label>
              {labRooms.length > 0 && (
                <label className="block">
                  <span className="label-system text-muted-foreground mb-2 block">Preferred Lab Type</span>
                  <select value={preferredLabType} onChange={(e) => setPreferredLabType(e.target.value as LabType)}
                    className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all">
                    {LAB_TYPES.map((lt) => <option key={lt} value={lt}>{lt}</option>)}
                  </select>
                </label>
              )}
            </>
          )}
        </div>

        <div>
          <span className="label-system text-muted-foreground mb-3 block">Assign to Branches</span>
          <div className="flex flex-wrap gap-2">
            {branches.map((b) => (
              <button key={b.id} onClick={() => toggleBranch(b.id)}
                className={cn('px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all',
                  selectedBranches.includes(b.id) ? 'bg-primary/15 text-primary glow-primary' : 'surface-highest text-muted-foreground hover:text-foreground')}>
                {b.shortName}
              </button>
            ))}
            {branches.length > 1 && (
              <button onClick={() => setSelectedBranches(selectedBranches.length === branches.length ? [] : branches.map((b) => b.id))}
                className="px-4 py-2.5 rounded-xl text-sm font-display font-medium ghost-border text-muted-foreground hover:text-foreground transition-all">
                {selectedBranches.length === branches.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleAdd}
            className="h-12 px-8 bg-primary text-primary-foreground rounded-xl text-sm font-display font-bold flex items-center gap-2 btn-bubble">
            <Plus className="size-4" /> Add Subject
          </button>
        </div>
      </div>

      {/* Subject list */}
      {subjects.length === 0 ? (
        <div className="surface-high rounded-2xl p-12 text-center">
          <BookOpen className="size-8 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No subjects added yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((s) => {
            const assignedBranches = (s.branchIds?.length > 0 ? s.branchIds : (s.branchId ? [s.branchId] : []))
              .map((bid) => branches.find((b) => b.id === bid)?.shortName).filter(Boolean);
            const subColor = subjectColors[s.name] || s.color;

            return (
              <div key={s.id} className="group flex items-center justify-between rounded-xl px-3 sm:px-4 py-3 surface-high transition-all hover:glow-primary">
                {editingId === s.id ? (
                  <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                    <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="flex-1 min-w-[80px] sm:min-w-[120px] h-8 px-2 sm:px-3 surface-highest rounded-lg text-sm font-body border-0 focus:outline-none focus:ring-1 focus:ring-primary" autoFocus />
                    <input value={editData.shortName} onChange={(e) => setEditData({ ...editData, shortName: e.target.value })} className="w-14 sm:w-20 h-8 px-2 sm:px-3 surface-highest rounded-lg text-sm font-body uppercase border-0 focus:outline-none focus:ring-1 focus:ring-primary" maxLength={6} />
                    <input value={editData.teacherName} onChange={(e) => setEditData({ ...editData, teacherName: e.target.value })} className="flex-1 min-w-[80px] sm:min-w-[100px] h-8 px-2 sm:px-3 surface-highest rounded-lg text-sm font-body border-0 focus:outline-none focus:ring-1 focus:ring-primary" />
                    <button onClick={saveEdit} className="size-8 flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0"><Check className="size-3.5" /></button>
                    <button onClick={() => setEditingId(null)} className="size-8 flex items-center justify-center rounded-lg bg-destructive/10 text-destructive shrink-0"><X className="size-3.5" /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <button onClick={() => setShowColorPicker(showColorPicker === s.id ? null : s.id)}
                          className="size-7 rounded-lg ghost-border transition-all hover:scale-110" style={{ backgroundColor: subColor || '#666' }} title="Change color" />
                        {showColorPicker === s.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(null)} />
                            <div className="absolute left-0 top-full mt-2 z-50 glass rounded-xl shadow-ambient p-3 min-w-[200px]">
                              <p className="label-system text-muted-foreground mb-2">Pick a color</p>
                              <div className="grid grid-cols-5 gap-1.5 mb-2">
                                {SUBJECT_PALETTE.map((c) => (
                                  <button key={c} onClick={() => { setSubjectColor(s.name, c); setShowColorPicker(null); }}
                                    className={cn('size-7 rounded-lg transition-all hover:scale-110', subColor === c ? 'ring-2 ring-white scale-110' : '')}
                                    style={{ backgroundColor: c }} />
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="size-7 rounded cursor-pointer" />
                                <button onClick={() => { setSubjectColor(s.name, customColor); setShowColorPicker(null); }}
                                  className="text-[10px] font-display font-semibold text-primary hover:underline">Apply</button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <span className={cn('px-2 py-0.5 label-system rounded-lg',
                        s.mode === 'theory' ? 'bg-primary/10 text-primary' : s.mode === 'practical' ? 'bg-secondary/10 text-secondary' : 'bg-violet-500/10 text-violet-300')}>
                        {s.mode === 'theory' ? 'THY' : s.mode === 'practical' ? 'LAB' : 'BOTH'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{s.name} <span className="text-muted-foreground font-display text-xs">({s.shortName})</span></p>
                        <p className="text-xs text-muted-foreground truncate">
                          {s.teacherName} · {s.mode === 'theory' ? `${s.theoryPerWeek}T/wk` : s.mode === 'practical' ? `${s.practicalPerWeek}P/wk` : `${s.theoryPerWeek}T+${s.practicalPerWeek}P`} · {assignedBranches.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(s)} className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><Pencil className="size-3.5" /></button>
                      <button onClick={() => removeSubject(s.id)} className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"><Trash2 className="size-3.5" /></button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
