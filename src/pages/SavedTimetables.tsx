import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimetableStore } from '@/stores/timetableStore';
import { toast } from '@/stores/toastStore';
import { Calendar, GitBranch, Clock, Trash2, Eye, BookOpen, Pin } from 'lucide-react';

export default function SavedTimetables() {
  const navigate = useNavigate();
  const { savedTimetables, loadSaved, deleteSaved, fetchSavedTimetables, isLoadingSaved } = useTimetableStore();

  // Fetch saved timetables from Supabase on mount
  useEffect(() => {
    fetchSavedTimetables();
  }, [fetchSavedTimetables]);

  function handleLoad(id: string) { loadSaved(id); toast({ title: 'Timetable loaded', variant: 'success' }); navigate('/timetable'); }
  async function handleDelete(id: string, name: string) { 
    await deleteSaved(id); 
    toast({ title: `Deleted "${name}"`, variant: 'default' }); 
  }

  if (isLoadingSaved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="size-20 rounded-2xl surface-high flex items-center justify-center mb-6">
          <Calendar className="size-9 text-muted-foreground/30 animate-pulse" />
        </div>
        <h2 className="font-display font-bold text-xl mb-2">Loading Timetables...</h2>
        <p className="text-muted-foreground text-sm text-center max-w-md">Fetching your saved timetables from the cloud.</p>
      </div>
    );
  }

  if (savedTimetables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="size-20 rounded-2xl surface-high flex items-center justify-center mb-6">
          <Calendar className="size-9 text-muted-foreground/30" />
        </div>
        <h2 className="font-display font-bold text-xl mb-2">No Saved Timetables</h2>
        <p className="text-muted-foreground text-sm text-center max-w-md mb-6">Generate a timetable first, then save it here for quick access.</p>
        <button onClick={() => navigate('/generator')} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display font-bold text-sm rounded-xl btn-bubble">
          <Calendar className="size-4" /> Create Timetable
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 xl:px-14 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl">Saved Timetables</h1>
          <p className="text-sm text-muted-foreground mt-1">{savedTimetables.length} timetable{savedTimetables.length !== 1 && 's'} in the cloud</p>
        </div>
        <button onClick={() => navigate('/generator')} className="h-10 sm:h-11 px-5 sm:px-6 bg-primary text-primary-foreground rounded-xl text-sm font-display font-bold btn-bubble self-start">+ New</button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {savedTimetables.map((st) => {
          const confirmedCount = st.confirmedClasses?.length ?? 0;
          return (
            <div key={st.id} className="surface-high rounded-2xl overflow-hidden transition-all hover:glow-primary group">
              <div className="p-5 pb-4">
                <h3 className="font-display font-bold text-base mb-3 truncate">{st.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="size-3" />{new Date(st.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><GitBranch className="size-3" />{st.branches.length} branch{st.branches.length !== 1 && 'es'}</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="size-3" />{st.subjects.length} subjects</span>
                  <span className="flex items-center gap-1.5"><Clock className="size-3" />{st.config.periodsPerDay}P/day</span>
                  {confirmedCount > 0 && <span className="flex items-center gap-1.5 text-emerald-400"><Pin className="size-3" />{confirmedCount} pinned</span>}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {st.branches.map((b) => (
                    <span key={b.id} className="px-2 py-1 label-system bg-primary/10 text-primary rounded-lg">{b.shortName}</span>
                  ))}
                </div>
              </div>
              <div className="flex surface-highest">
                <button onClick={() => handleLoad(st.id)} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-display font-semibold text-primary hover:bg-primary/10 transition-colors">
                  <Eye className="size-4" /> View
                </button>
                <button onClick={() => handleDelete(st.id, st.name)} className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-display font-medium text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
