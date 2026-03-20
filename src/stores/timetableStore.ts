import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GeneralConfig,
  Branch,
  Subject,
  CombinedClass,
  TimetableCell,
  SavedTimetable,
  LabRoom,
  ConfirmedClass,
} from '@/types';
import { DEFAULT_CONFIG } from '@/constants/config';
import { generateTimetables } from '@/lib/generator';
import { generateId } from '@/lib/utils';

type GridSnapshot = Record<string, (TimetableCell | null)[][]>;

function cloneGrids(grids: GridSnapshot): GridSnapshot {
  return JSON.parse(JSON.stringify(grids));
}

interface TimetableStore {
  currentStep: number;
  generalConfig: GeneralConfig;
  branches: Branch[];
  labRooms: LabRoom[];
  subjects: Subject[];
  combinedClasses: CombinedClass[];
  confirmedClasses: ConfirmedClass[];
  generatedTimetables: GridSnapshot;
  generationWarnings: string[];
  hasGenerated: boolean;
  savedTimetables: SavedTimetable[];
  subjectColors: Record<string, string>;

  undoStack: GridSnapshot[];
  redoStack: GridSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  setCurrentStep: (step: number) => void;
  setGeneralConfig: (config: GeneralConfig) => void;
  addBranch: (branch: Branch) => void;
  removeBranch: (id: string) => void;
  updateBranch: (id: string, partial: Partial<Branch>) => void;
  addLabRoom: (lab: LabRoom) => void;
  removeLabRoom: (id: string) => void;
  updateLabRoom: (id: string, partial: Partial<LabRoom>) => void;
  addSubject: (subject: Subject) => void;
  removeSubject: (id: string) => void;
  updateSubject: (id: string, partial: Partial<Subject>) => void;
  addCombinedClass: (cc: CombinedClass) => void;
  removeCombinedClass: (id: string) => void;
  addConfirmedClass: (cc: ConfirmedClass) => void;
  removeConfirmedClass: (id: string) => void;
  setSubjectColor: (subjectName: string, color: string) => void;
  generate: () => void;
  saveCurrent: (name: string) => void;
  loadSaved: (id: string) => void;
  deleteSaved: (id: string) => void;
  resetWizard: () => void;
  swapCells: (
    branchId: string,
    day1: number,
    period1: number,
    day2: number,
    period2: number
  ) => void;
  updateTimetables: (timetables: GridSnapshot) => void;
  editInputs: () => void;
}

const MAX_HISTORY = 50;

export const useTimetableStore = create<TimetableStore>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      generalConfig: { ...DEFAULT_CONFIG },
      branches: [],
      labRooms: [],
      subjects: [],
      combinedClasses: [],
      confirmedClasses: [],
      generatedTimetables: {},
      generationWarnings: [],
      hasGenerated: false,
      savedTimetables: [],
      subjectColors: {},

      undoStack: [],
      redoStack: [],
      canUndo: false,
      canRedo: false,

      pushHistory: () => {
        const { generatedTimetables, undoStack } = get();
        const snapshot = cloneGrids(generatedTimetables);
        const newStack = [...undoStack, snapshot].slice(-MAX_HISTORY);
        set({ undoStack: newStack, redoStack: [], canUndo: true, canRedo: false });
      },

      undo: () => {
        const { undoStack, generatedTimetables } = get();
        if (undoStack.length === 0) return;
        const newUndo = [...undoStack];
        const prev = newUndo.pop()!;
        const currentSnapshot = cloneGrids(generatedTimetables);
        set((s) => ({
          undoStack: newUndo,
          redoStack: [...s.redoStack, currentSnapshot],
          generatedTimetables: prev,
          canUndo: newUndo.length > 0,
          canRedo: true,
        }));
      },

      redo: () => {
        const { redoStack, generatedTimetables } = get();
        if (redoStack.length === 0) return;
        const newRedo = [...redoStack];
        const next = newRedo.pop()!;
        const currentSnapshot = cloneGrids(generatedTimetables);
        set((s) => ({
          redoStack: newRedo,
          undoStack: [...s.undoStack, currentSnapshot],
          generatedTimetables: next,
          canUndo: true,
          canRedo: newRedo.length > 0,
        }));
      },

      setCurrentStep: (step) => set({ currentStep: step }),
      setGeneralConfig: (config) => set({ generalConfig: config }),

      addBranch: (branch) =>
        set((s) => ({ branches: [...s.branches, branch] })),

      removeBranch: (id) =>
        set((s) => ({
          branches: s.branches.filter((b) => b.id !== id),
          subjects: s.subjects.map((sub) => ({
            ...sub,
            branchIds: sub.branchIds.filter((bid) => bid !== id),
          })),
          combinedClasses: s.combinedClasses.map((cc) => ({
            ...cc,
            branchIds: cc.branchIds.filter((bid) => bid !== id),
          })),
          confirmedClasses: s.confirmedClasses.filter((cc) => cc.branchId !== id),
        })),

      updateBranch: (id, partial) =>
        set((s) => ({
          branches: s.branches.map((b) =>
            b.id === id ? { ...b, ...partial } : b
          ),
        })),

      addLabRoom: (lab) =>
        set((s) => ({ labRooms: [...s.labRooms, lab] })),

      removeLabRoom: (id) =>
        set((s) => ({ labRooms: s.labRooms.filter((l) => l.id !== id) })),

      updateLabRoom: (id, partial) =>
        set((s) => ({
          labRooms: s.labRooms.map((l) =>
            l.id === id ? { ...l, ...partial } : l
          ),
        })),

      addSubject: (subject) =>
        set((s) => ({ subjects: [...s.subjects, subject] })),

      removeSubject: (id) =>
        set((s) => ({ subjects: s.subjects.filter((sub) => sub.id !== id) })),

      updateSubject: (id, partial) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === id ? { ...sub, ...partial } : sub
          ),
        })),

      addCombinedClass: (cc) =>
        set((s) => ({ combinedClasses: [...s.combinedClasses, cc] })),

      removeCombinedClass: (id) =>
        set((s) => ({
          combinedClasses: s.combinedClasses.filter((cc) => cc.id !== id),
        })),

      addConfirmedClass: (cc) =>
        set((s) => ({ confirmedClasses: [...s.confirmedClasses, cc] })),

      removeConfirmedClass: (id) =>
        set((s) => ({
          confirmedClasses: s.confirmedClasses.filter((cc) => cc.id !== id),
        })),

      setSubjectColor: (subjectName, color) =>
        set((s) => ({
          subjectColors: { ...s.subjectColors, [subjectName]: color },
        })),

      generate: () => {
        const { generalConfig, branches, subjects, combinedClasses, confirmedClasses, labRooms, subjectColors } = get();
        const result = generateTimetables(generalConfig, branches, subjects, combinedClasses, confirmedClasses, labRooms, subjectColors);
        set({
          generatedTimetables: result.timetables,
          generationWarnings: result.warnings,
          hasGenerated: true,
          undoStack: [],
          redoStack: [],
          canUndo: false,
          canRedo: false,
        });
      },

      saveCurrent: (name) => {
        const s = get();
        const saved: SavedTimetable = {
          id: generateId(),
          name,
          createdAt: new Date().toISOString(),
          config: s.generalConfig,
          branches: s.branches,
          subjects: s.subjects,
          combinedClasses: s.combinedClasses,
          confirmedClasses: s.confirmedClasses,
          labRooms: s.labRooms,
          timetables: s.generatedTimetables,
          warnings: s.generationWarnings,
          subjectColors: s.subjectColors,
        };
        set((state) => ({
          savedTimetables: [saved, ...state.savedTimetables],
        }));
      },

      loadSaved: (id) => {
        const saved = get().savedTimetables.find((s) => s.id === id);
        if (!saved) return;
        set({
          generalConfig: saved.config,
          branches: saved.branches,
          subjects: saved.subjects,
          combinedClasses: saved.combinedClasses,
          confirmedClasses: saved.confirmedClasses ?? [],
          labRooms: saved.labRooms ?? [],
          generatedTimetables: saved.timetables,
          generationWarnings: saved.warnings,
          hasGenerated: true,
          subjectColors: saved.subjectColors ?? {},
          undoStack: [],
          redoStack: [],
          canUndo: false,
          canRedo: false,
        });
      },

      deleteSaved: (id) =>
        set((s) => ({
          savedTimetables: s.savedTimetables.filter((st) => st.id !== id),
        })),

      resetWizard: () =>
        set({
          currentStep: 0,
          generalConfig: { ...DEFAULT_CONFIG },
          branches: [],
          labRooms: [],
          subjects: [],
          combinedClasses: [],
          confirmedClasses: [],
          generatedTimetables: {},
          generationWarnings: [],
          hasGenerated: false,
          subjectColors: {},
          undoStack: [],
          redoStack: [],
          canUndo: false,
          canRedo: false,
        }),

      editInputs: () => {
        set({ currentStep: 0 });
      },

      swapCells: (branchId, day1, period1, day2, period2) => {
        const state = get();
        const grid = state.generatedTimetables[branchId];
        if (!grid) return;
        const cellA = grid[day1]?.[period1] ?? null;
        const cellB = grid[day2]?.[period2] ?? null;
        if (cellA?.isConfirmed || cellB?.isConfirmed) return;

        state.pushHistory();

        const grids = cloneGrids(state.generatedTimetables);
        const g = grids[branchId];
        if (!g) return;

        const cA = g[day1]?.[period1] ?? null;
        const cB = g[day2]?.[period2] ?? null;
        const isLabStartA = cA && cA.isLab && !cA.isLabContinuation;
        const isLabStartB = cB && cB.isLab && !cB.isLabContinuation;
        const isLabContA = cA?.isLabContinuation;
        const isLabContB = cB?.isLabContinuation;

        if (isLabContA || isLabContB) return;

        if (!isLabStartA && !isLabStartB) {
          g[day1][period1] = cB;
          g[day2][period2] = cA;
        } else if (isLabStartA && !isLabStartB) {
          const numPeriods = state.generalConfig.periodsPerDay;
          if (period2 + 1 >= numPeriods) return;
          const cellBelow = g[day2]?.[period2 + 1] ?? null;
          if (cellBelow && !cellBelow.isLabContinuation) return;
          g[day1][period1] = cB;
          g[day1][period1 + 1] = null;
          g[day2][period2] = cA;
          g[day2][period2 + 1] = { ...cA!, isLabContinuation: true };
        } else if (!isLabStartA && isLabStartB) {
          const numPeriods = state.generalConfig.periodsPerDay;
          if (period1 + 1 >= numPeriods) return;
          const cellBelow = g[day1]?.[period1 + 1] ?? null;
          if (cellBelow && !cellBelow.isLabContinuation) return;
          g[day2][period2] = cA;
          g[day2][period2 + 1] = null;
          g[day1][period1] = cB;
          g[day1][period1 + 1] = { ...cB!, isLabContinuation: true };
        } else {
          const numPeriods = state.generalConfig.periodsPerDay;
          if (period1 + 1 >= numPeriods || period2 + 1 >= numPeriods) return;
          const contA = g[day1][period1 + 1];
          const contB = g[day2][period2 + 1];
          g[day1][period1] = cB;
          g[day1][period1 + 1] = contB;
          g[day2][period2] = cA;
          g[day2][period2 + 1] = contA;
        }

        set({ generatedTimetables: grids });
      },

      updateTimetables: (timetables) => set({ generatedTimetables: timetables }),
    }),
    {
      name: 'timeforge-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        generalConfig: state.generalConfig,
        branches: state.branches,
        labRooms: state.labRooms,
        subjects: state.subjects,
        combinedClasses: state.combinedClasses,
        confirmedClasses: state.confirmedClasses,
        generatedTimetables: state.generatedTimetables,
        generationWarnings: state.generationWarnings,
        hasGenerated: state.hasGenerated,
        savedTimetables: state.savedTimetables,
        subjectColors: state.subjectColors,
      }),
    }
  )
);
