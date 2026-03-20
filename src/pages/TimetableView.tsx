import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTimetableStore } from '@/stores/timetableStore';
import { toast } from '@/stores/toastStore';
import TimetableGrid from '@/components/features/TimetableGrid';
import TeacherView from '@/components/features/TeacherView';
import SubjectView from '@/components/features/SubjectView';
import AllDepartmentsView from '@/components/features/AllDepartmentsView';
import LabView from '@/components/features/LabView';
import { exportPDF, exportExcel, extractTeachers, extractSubjects } from '@/lib/export';
import { cn } from '@/lib/utils';
import type { ViewMode } from '@/types';
import {
  Printer, Save, AlertTriangle, ArrowLeft, RefreshCw, FileSpreadsheet, FileText,
  GitBranch, User, BookOpen, LayoutGrid, GripVertical, ChevronDown, Undo2, Redo2,
  FlaskConical, Pencil, Pin,
} from 'lucide-react';

// Sound effect for regenerate button
const generateSound = new Audio('/faaah.mp3');

const VIEW_MODES: { key: ViewMode; label: string; icon: typeof GitBranch }[] = [
  { key: 'branch', label: 'Branch', icon: GitBranch },
  { key: 'teacher', label: 'Teacher', icon: User },
  { key: 'subject', label: 'Subject', icon: BookOpen },
  { key: 'all-departments', label: 'All Depts', icon: LayoutGrid },
  { key: 'lab', label: 'Labs', icon: FlaskConical },
];

export default function TimetableView() {
  const navigate = useNavigate();
  const { branches, generalConfig, generatedTimetables, generationWarnings, hasGenerated, generate, saveCurrent, swapCells, canUndo, canRedo, undo, redo, labRooms, confirmedClasses, editInputs } = useTimetableStore();

  const [viewMode, setViewMode] = useState<ViewMode>('branch');
  const [activeBranch, setActiveBranch] = useState(branches[0]?.id ?? '');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const teachers = useMemo(() => extractTeachers(generatedTimetables, branches), [generatedTimetables, branches]);
  const subjects = useMemo(() => extractSubjects(generatedTimetables, branches), [generatedTimetables, branches]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'teacher' && !selectedTeacher && teachers.length > 0) setSelectedTeacher(teachers[0]);
    if (mode === 'subject' && !selectedSubject && subjects.length > 0) setSelectedSubject(subjects[0]);
  }, [teachers, subjects, selectedTeacher, selectedSubject]);

  if (!hasGenerated || branches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <AlertTriangle className="size-12 text-secondary mb-4" />
        <h2 className="font-display font-bold text-xl mb-2">No Timetable Generated</h2>
        <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">You haven&apos;t generated a timetable yet. Go to the generator to set up your branches and subjects.</p>
        <Link to="/generator" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display font-bold text-sm rounded-xl btn-bubble">Open Generator</Link>
      </div>
    );
  }

  const currentGrid = generatedTimetables[activeBranch];
  const currentBranch = branches.find((b) => b.id === activeBranch);

  function handleRegenerate() { generate(); generateSound.currentTime = 0; generateSound.play().catch(() => {}); toast({ title: 'Timetable re-forged! Confirmed classes preserved.', variant: 'success' }); }
  function handleSave() { const name = saveName.trim() || `Timetable — ${new Date().toLocaleDateString()}`; saveCurrent(name); setShowSaveInput(false); setSaveName(''); toast({ title: `Saved as "${name}"`, variant: 'success' }); }
  function handleExportPDF() { exportPDF(); setShowExportMenu(false); }
  function handleExportExcel() { exportExcel(generatedTimetables, branches, generalConfig); toast({ title: 'Excel exported!', variant: 'success' }); setShowExportMenu(false); }
  function handleSwap(day1: number, period1: number, day2: number, period2: number) { swapCells(activeBranch, day1, period1, day2, period2); toast({ title: 'Cells swapped', variant: 'success' }); }
  function handleEditInputs() { editInputs(); navigate('/generator'); toast({ title: 'Editing inputs — your data is preserved', variant: 'default' }); }

  return (
    <div className="px-6 lg:px-10 xl:px-14 py-6 fade-in">
      {/* Toolbar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/generator')} className="size-9 surface-high rounded-xl flex items-center justify-center hover:scale-105 transition-all"><ArrowLeft className="size-4" /></button>
          <h1 className="font-display font-bold text-xl">Forged Timetable</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleEditInputs} className="h-9 px-4 surface-high rounded-xl text-sm font-display font-medium flex items-center gap-2 text-secondary transition-all hover:scale-[1.02] active:scale-[0.98]"><Pencil className="size-3.5" /> Edit Inputs</button>
          {viewMode === 'branch' && (
            <div className="flex items-center gap-0.5 surface-high rounded-xl overflow-hidden">
              <button onClick={() => { undo(); }} disabled={!canUndo} className="h-9 px-3 text-sm font-display font-medium flex items-center gap-1 hover:bg-primary/10 transition-all disabled:opacity-30" title="Undo"><Undo2 className="size-3.5" /></button>
              <button onClick={() => { redo(); }} disabled={!canRedo} className="h-9 px-3 text-sm font-display font-medium flex items-center gap-1 hover:bg-primary/10 transition-all disabled:opacity-30" title="Redo"><Redo2 className="size-3.5" /></button>
            </div>
          )}
          {viewMode === 'branch' && (
            <button onClick={() => setDragEnabled(!dragEnabled)}
              className={cn('h-9 px-4 rounded-xl text-sm font-display font-medium flex items-center gap-2 transition-all',
                dragEnabled ? 'bg-primary/15 text-primary glow-primary' : 'surface-high hover:bg-primary/5')}>
              <GripVertical className="size-3.5" /> {dragEnabled ? 'Editing' : 'Edit'}
            </button>
          )}
          <button onClick={handleRegenerate} className="h-9 px-4 surface-high rounded-xl text-sm font-display font-medium flex items-center gap-2 transition-all hover:scale-[1.02]"><RefreshCw className="size-3.5" /> Regenerate</button>
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="h-9 px-4 surface-high rounded-xl text-sm font-display font-medium flex items-center gap-2"><FileText className="size-3.5" /> Export <ChevronDown className="size-3" /></button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 glass rounded-xl shadow-ambient py-1.5 min-w-[170px] ghost-border">
                  <button onClick={handleExportPDF} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-display font-medium hover:bg-primary/10 transition-all"><Printer className="size-4 text-primary" /> Print / PDF</button>
                  <button onClick={handleExportExcel} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-display font-medium hover:bg-primary/10 transition-all"><FileSpreadsheet className="size-4 text-emerald-400" /> Export Excel</button>
                </div>
              </>
            )}
          </div>
          {showSaveInput ? (
            <div className="flex items-center gap-2">
              <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Timetable name..." onKeyDown={(e) => e.key === 'Enter' && handleSave()} autoFocus
                className="h-9 px-4 surface-highest rounded-xl text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary w-44" />
              <button onClick={handleSave} className="h-9 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-display font-bold">Save</button>
              <button onClick={() => setShowSaveInput(false)} className="h-9 px-2 text-muted-foreground text-sm">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowSaveInput(true)} className="h-9 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-display font-bold flex items-center gap-2 btn-bubble"><Save className="size-3.5" /> Save</button>
          )}
        </div>
      </div>

      {confirmedClasses.length > 0 && (
        <div className="no-print flex items-center gap-2 px-4 py-2.5 bg-emerald-500/5 rounded-xl mb-5 ghost-border">
          <Pin className="size-3.5 text-emerald-400" />
          <span className="text-xs font-display font-medium text-emerald-400">{confirmedClasses.length} confirmed class{confirmedClasses.length !== 1 && 'es'} pinned — locked during editing</span>
        </div>
      )}

      {generationWarnings.length > 0 && (
        <div className="no-print surface-high rounded-xl px-5 py-4 mb-5">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="size-4 text-secondary" /><span className="label-system text-secondary">{generationWarnings.length} Warning{generationWarnings.length > 1 && 's'}</span></div>
          <ul className="space-y-0.5">{generationWarnings.map((w, i) => <li key={i} className="text-xs text-secondary/70">• {w}</li>)}</ul>
        </div>
      )}

      {/* View mode */}
      <div className="no-print flex flex-wrap items-center gap-2 mb-6">
        <span className="label-system text-muted-foreground mr-1">View:</span>
        {VIEW_MODES.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => handleViewModeChange(key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all',
              viewMode === key ? 'bg-primary/15 text-primary glow-primary' : 'surface-high text-muted-foreground hover:text-foreground')}>
            <Icon className="size-3.5" /> {label}
          </button>
        ))}
      </div>

      {viewMode === 'branch' && (
        <>
          <div className="no-print flex gap-2 overflow-x-auto mb-5 pb-1">
            {branches.map((b) => (
              <button key={b.id} onClick={() => setActiveBranch(b.id)}
                className={cn('px-5 py-2.5 rounded-xl text-sm font-display font-bold whitespace-nowrap transition-all',
                  activeBranch === b.id ? 'bg-primary/15 text-primary glow-primary' : 'surface-high text-muted-foreground hover:text-foreground')}>
                {b.name} ({b.shortName})
              </button>
            ))}
          </div>
          {currentGrid && currentBranch && (
            <>
              {dragEnabled && (
                <div className="no-print mb-3 flex items-center gap-2 px-4 py-2.5 bg-primary/5 rounded-xl text-sm text-primary ghost-border">
                  <GripVertical className="size-4" /> Drag & drop active — drag classes to swap. Confirmed cells are locked.
                </div>
              )}
              <TimetableGrid grid={currentGrid} config={generalConfig} branchName={currentBranch.name} branchId={activeBranch} enableDrag={dragEnabled} onSwap={handleSwap} />
            </>
          )}
        </>
      )}

      {viewMode === 'teacher' && (
        <>
          <div className="no-print flex gap-2 overflow-x-auto mb-5 pb-1">
            {teachers.map((t) => (
              <button key={t} onClick={() => setSelectedTeacher(t)} className={cn('px-5 py-2.5 rounded-xl text-sm font-display font-bold whitespace-nowrap transition-all', selectedTeacher === t ? 'bg-primary/15 text-primary glow-primary' : 'surface-high text-muted-foreground')}>{t}</button>
            ))}
          </div>
          {selectedTeacher && <TeacherView timetables={generatedTimetables} branches={branches} config={generalConfig} selectedTeacher={selectedTeacher} />}
        </>
      )}

      {viewMode === 'subject' && (
        <>
          <div className="no-print flex gap-2 overflow-x-auto mb-5 pb-1">
            {subjects.map((s) => (
              <button key={s} onClick={() => setSelectedSubject(s)} className={cn('px-5 py-2.5 rounded-xl text-sm font-display font-bold whitespace-nowrap transition-all', selectedSubject === s ? 'bg-primary/15 text-primary glow-primary' : 'surface-high text-muted-foreground')}>{s}</button>
            ))}
          </div>
          {selectedSubject && <SubjectView timetables={generatedTimetables} branches={branches} config={generalConfig} selectedSubject={selectedSubject} />}
        </>
      )}

      {viewMode === 'all-departments' && <AllDepartmentsView timetables={generatedTimetables} branches={branches} config={generalConfig} />}
      {viewMode === 'lab' && <LabView timetables={generatedTimetables} branches={branches} config={generalConfig} labRooms={labRooms} />}

      <div className="no-print flex flex-wrap gap-5 mt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2"><div className="size-3.5 rounded-lg bg-secondary/20" /> Lab (2 periods)</div>
        <div className="flex items-center gap-2"><div className="size-3.5 rounded-lg bg-sky-500/20" /> Combined</div>
        <div className="flex items-center gap-2"><div className="size-3.5 rounded-lg bg-emerald-500/20" /><Pin className="size-2.5" /> Confirmed</div>
        <div className="flex items-center gap-2"><span className="text-muted-foreground/30">—</span> Free period</div>
      </div>
    </div>
  );
}
