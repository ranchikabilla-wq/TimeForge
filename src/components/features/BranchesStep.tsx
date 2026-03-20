import { useState } from 'react';
import { useTimetableStore } from '@/stores/timetableStore';
import { generateId, cn } from '@/lib/utils';
import { toast } from '@/stores/toastStore';
import { GitBranch, Plus, Trash2, Pencil, Check, X, Lightbulb } from 'lucide-react';

export default function BranchesStep() {
  const { branches, addBranch, removeBranch, updateBranch } = useTimetableStore();
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editShort, setEditShort] = useState('');

  function handleAdd() {
    const trimName = name.trim();
    const trimShort = shortName.trim() || trimName.slice(0, 4).toUpperCase();
    if (!trimName) {
      toast({ title: 'Branch name required', variant: 'destructive' });
      return;
    }
    addBranch({ id: generateId(), name: trimName, shortName: trimShort });
    setName('');
    setShortName('');
    toast({ title: `Added "${trimName}"`, variant: 'success' });
  }

  function startEdit(b: { id: string; name: string; shortName: string }) {
    setEditingId(b.id);
    setEditName(b.name);
    setEditShort(b.shortName);
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return;
    updateBranch(editingId, { name: editName.trim(), shortName: editShort.trim() || editName.trim().slice(0, 4).toUpperCase() });
    setEditingId(null);
    toast({ title: 'Branch updated', variant: 'success' });
  }

  function cancelEdit() { setEditingId(null); }

  return (
    <div className="fade-in space-y-8">
      <div className="mb-2">
        <span className="label-system text-primary mb-3 block">Step 02 — Forge Matrix</span>
        <h2 className="font-display font-bold text-2xl lg:text-3xl">
          Configure <span className="text-primary italic">Branches</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
          Add all branches / departments to initialize the Forge matrix.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add form */}
        <div className="surface-high rounded-2xl p-6 space-y-4">
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Branch Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer Science"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </label>
          <label className="block">
            <span className="label-system text-muted-foreground mb-2 block">Short Name</span>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="e.g. CSE"
              maxLength={6}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body uppercase border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </label>
          <button
            onClick={handleAdd}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 btn-bubble"
          >
            <Plus className="size-4" /> Add Branch
          </button>

          <div className="surface-highest rounded-xl p-4 flex items-start gap-3 mt-2">
            <Lightbulb className="size-4 text-secondary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary font-semibold">Tip:</span> Use unique short names to prevent conflicts in the timetable grid view.
            </p>
          </div>
        </div>

        {/* Branch list */}
        <div className="surface-high rounded-2xl p-6">
          {branches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-16 rounded-2xl surface-highest flex items-center justify-center mb-4">
                <GitBranch className="size-7 text-primary/40" />
              </div>
              <h3 className="font-display font-bold text-base mb-1">No branches added yet</h3>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                The architecture of your institution starts here. Define your departments to generate the kinetic structure.
              </p>
              <span className="label-system text-muted-foreground/40 mt-4">Awaiting Input</span>
            </div>
          ) : (
            <div className="space-y-2">
              {branches.map((b, idx) => (
                <div
                  key={b.id}
                  className={cn(
                    'group flex items-center justify-between rounded-xl px-4 py-3 surface-highest transition-all hover:glow-primary',
                    editingId === b.id && 'ring-1 ring-primary/30'
                  )}
                >
                  {editingId === b.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 h-8 px-3 surface-high rounded-lg text-sm font-body border-0 focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <input
                        type="text"
                        value={editShort}
                        onChange={(e) => setEditShort(e.target.value)}
                        className="w-20 h-8 px-3 surface-high rounded-lg text-sm font-body uppercase border-0 focus:outline-none focus:ring-1 focus:ring-primary"
                        maxLength={6}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <button onClick={saveEdit} className="size-8 flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all">
                        <Check className="size-3.5" />
                      </button>
                      <button onClick={cancelEdit} className="size-8 flex items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="size-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-display text-xs font-bold">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{b.name}</p>
                          <p className="text-xs text-muted-foreground font-display">{b.shortName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(b)}
                          className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          aria-label={`Edit ${b.name}`}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => removeBranch(b.id)}
                          className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          aria-label={`Remove ${b.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
