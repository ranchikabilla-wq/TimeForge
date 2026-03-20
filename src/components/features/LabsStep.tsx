import { useState } from 'react';
import { useTimetableStore } from '@/stores/timetableStore';
import { generateId, cn } from '@/lib/utils';
import { toast } from '@/stores/toastStore';
import { FlaskConical, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import type { LabType } from '@/types';
import { LAB_TYPES } from '@/types';
import { LAB_TYPE_ICONS } from '@/constants/config';

export default function LabsStep() {
  const { labRooms, addLabRoom, removeLabRoom, updateLabRoom } = useTimetableStore();
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [capacity, setCapacity] = useState(30);
  const [labType, setLabType] = useState<LabType>('Computer Lab');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editShort, setEditShort] = useState('');
  const [editCapacity, setEditCapacity] = useState(30);
  const [editType, setEditType] = useState<LabType>('Computer Lab');

  function handleAdd() {
    const trimName = name.trim();
    if (!trimName) {
      toast({ title: 'Lab name required', variant: 'destructive' });
      return;
    }
    addLabRoom({
      id: generateId(),
      name: trimName,
      shortName: shortName.trim() || trimName.slice(0, 5).toUpperCase(),
      capacity,
      labType,
    });
    setName('');
    setShortName('');
    setCapacity(30);
    toast({ title: `Added "${trimName}"`, variant: 'success' });
  }

  function startEdit(l: { id: string; name: string; shortName: string; capacity: number; labType: LabType }) {
    setEditingId(l.id);
    setEditName(l.name);
    setEditShort(l.shortName);
    setEditCapacity(l.capacity);
    setEditType(l.labType);
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return;
    updateLabRoom(editingId, { name: editName.trim(), shortName: editShort.trim(), capacity: editCapacity, labType: editType });
    setEditingId(null);
    toast({ title: 'Lab updated', variant: 'success' });
  }

  return (
    <div className="fade-in space-y-8">
      <div className="mb-2">
        <span className="label-system text-primary mb-3 block">Step 03 — Lab Infrastructure</span>
        <h2 className="font-display font-bold text-2xl lg:text-3xl">Lab Rooms</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
          Define physical lab rooms with type and capacity
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="surface-high rounded-2xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-sm text-primary flex items-center gap-2">
            <FlaskConical className="size-4" /> New Lab Specification
          </h3>
          <div className="space-y-4">
            <label className="block">
              <span className="label-system text-muted-foreground mb-2 block">Lab Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Robotics Engineering Lab A"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="label-system text-muted-foreground mb-2 block">Short Name</span>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="ROBO-A"
                  maxLength={8}
                  className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body uppercase border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all"
                />
              </label>
              <label className="block">
                <span className="label-system text-muted-foreground mb-2 block">Capacity</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all"
                />
              </label>
            </div>
            <label className="block">
              <span className="label-system text-muted-foreground mb-2 block">Lab Type</span>
              <select
                value={labType}
                onChange={(e) => setLabType(e.target.value as LabType)}
                className="w-full h-12 px-4 surface-highest rounded-xl text-base font-body border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-all"
              >
                {LAB_TYPES.map((lt) => (
                  <option key={lt} value={lt}>{lt}</option>
                ))}
              </select>
            </label>
            <button
              onClick={handleAdd}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 btn-bubble"
            >
              <Plus className="size-4" /> + Add Lab
            </button>
          </div>
        </div>

        <div className="surface-high rounded-2xl p-6">
          {labRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-16 rounded-2xl surface-highest flex items-center justify-center mb-4">
                <FlaskConical className="size-7 text-primary/40" />
              </div>
              <h3 className="font-display font-bold text-base mb-1 italic">No lab rooms defined yet</h3>
              <p className="text-xs text-muted-foreground max-w-[260px]">
                Start by configuring your physical laboratory assets on the left to populate your timetable infrastructure.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {labRooms.map((lab) => (
                <div key={lab.id} className="group flex items-center justify-between rounded-xl px-4 py-3 surface-highest transition-all hover:glow-primary">
                  {editingId === lab.id ? (
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 min-w-[120px] h-8 px-3 surface-high rounded-lg text-sm font-body border-0 focus:outline-none focus:ring-1 focus:ring-primary" autoFocus />
                      <input value={editShort} onChange={(e) => setEditShort(e.target.value)} className="w-20 h-8 px-3 surface-high rounded-lg text-sm font-body uppercase border-0 focus:outline-none focus:ring-1 focus:ring-primary" maxLength={8} />
                      <input type="number" value={editCapacity} onChange={(e) => setEditCapacity(Number(e.target.value))} className="w-16 h-8 px-2 surface-high rounded-lg text-sm font-body border-0 focus:outline-none focus:ring-1 focus:ring-primary" />
                      <select value={editType} onChange={(e) => setEditType(e.target.value as LabType)} className="h-8 px-2 surface-high rounded-lg text-xs font-body border-0 focus:outline-none focus:ring-1 focus:ring-primary">
                        {LAB_TYPES.map((lt) => <option key={lt} value={lt}>{lt}</option>)}
                      </select>
                      <button onClick={saveEdit} className="size-8 flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400"><Check className="size-3.5" /></button>
                      <button onClick={() => setEditingId(null)} className="size-8 flex items-center justify-center rounded-lg bg-destructive/10 text-destructive"><X className="size-3.5" /></button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="size-9 flex items-center justify-center rounded-lg surface-high text-lg shrink-0">
                          {LAB_TYPE_ICONS[lab.labType]}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{lab.name}</p>
                          <p className="label-system text-muted-foreground">{lab.shortName} · {lab.capacity} seats · {lab.labType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(lab)} className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><Pencil className="size-3.5" /></button>
                        <button onClick={() => removeLabRoom(lab.id)} className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"><Trash2 className="size-3.5" /></button>
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
