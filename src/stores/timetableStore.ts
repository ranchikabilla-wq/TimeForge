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
  RemainingSubject, // <-- Added import
} from '@/types';
import { DEFAULT_CONFIG } from '@/constants/config';
import { generateTimetables } from '@/lib/generator';
import { generateId } from '@/lib/utils';
import {
  loadTimetables,
  createTimetable,
  deleteTimetable as deleteTimetableDB,
  subscribeTimetables,
} from '@/lib/supabaseOperations';

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
  isLoadingSaved: boolean;

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
  saveCurrent: (name: string) => Promise<void>;
  loadSaved: (id: string) => void;
  deleteSaved: (id: string) => Promise<void>;
  fetchSavedTimetables: () => Promise<void>;
  resetWizard: () => void;
  swapCells: (
  sourceBranchId: string,
  day1: number,
  period1: number,
  day2: number,
  period2: number,
  targetBranchId?: string
) => void;
  updateTimetables: (timetables: GridSnapshot) => void;
  updateClass: (branchId: string,day: number,period: number,updates: Partial<TimetableCell>,duration: 1 | 2) => void;
  editInputs: () => void;

  // --- NEW METHODS FOR MANUAL ASSIGNMENT ---
  getRemainingSubjects: (branchId: string) => RemainingSubject[];
  assignSubject: (branchId: string, day: number, period: number, subject: RemainingSubject, labRoomName?: string, labRoomShortName?: string) => void;
  removeManualSubject: (branchId: string, day: number, period: number) => void;
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
      isLoadingSaved: false,

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

      saveCurrent: async (name) => {
        const s = get();
        const timetableData = {
          name,
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

        // Save to Supabase
        const saved = await createTimetable(timetableData);
        
        if (saved) {
          // Update local state with the saved timetable
          set((state) => ({
            savedTimetables: [saved, ...state.savedTimetables],
          }));
        } else {
          console.error('Failed to save timetable to Supabase');
        }
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

      deleteSaved: async (id) => {
        // Delete from Supabase
        const success = await deleteTimetableDB(id);
        
        if (success) {
          // Update local state
          set((s) => ({
            savedTimetables: s.savedTimetables.filter((st) => st.id !== id),
          }));
        } else {
          console.error('Failed to delete timetable from Supabase');
        }
      },

      fetchSavedTimetables: async () => {
        set({ isLoadingSaved: true });
        try {
          const timetables = await loadTimetables();
          set({ savedTimetables: timetables, isLoadingSaved: false });
        } catch (error) {
          console.error('Failed to fetch saved timetables:', error);
          set({ isLoadingSaved: false });
        }
      },

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

      swapCells: (
  sourceBranchId,
  day1,
  period1,
  day2,
  period2,
  targetBranchId = sourceBranchId
) => {
  const state = get();

  const sourceGrid = state.generatedTimetables[sourceBranchId];
  const targetGrid = state.generatedTimetables[targetBranchId];

  if (!sourceGrid || !targetGrid) return;

  const cellA = sourceGrid[day1]?.[period1] ?? null;
  const cellB = targetGrid[day2]?.[period2] ?? null;

  // Confirmed classes cannot be moved.
  if (cellA?.isConfirmed || cellB?.isConfirmed) return;

  // Never start a drag from the continuation half of a lab.
  if (cellA?.isLabContinuation || cellB?.isLabContinuation) return;

  state.pushHistory();

  const grids = cloneGrids(state.generatedTimetables);

  const source = grids[sourceBranchId];
  const target = grids[targetBranchId];

  if (!source || !target) return;

  const cA = source[day1]?.[period1] ?? null;
  const cB = target[day2]?.[period2] ?? null;

  const isLabStartA =
    cA && cA.isLab && !cA.isLabContinuation;

  const isLabStartB =
    cB && cB.isLab && !cB.isLabContinuation;

  /*
   * Same branch
   * -----------------------------------------
   * Keep the existing lab-aware swapping logic.
   */
  if (sourceBranchId === targetBranchId) {
    const g = source;

    if (!isLabStartA && !isLabStartB) {
      g[day1][period1] = cB;
      g[day2][period2] = cA;
    }

    else if (isLabStartA && !isLabStartB) {
      const numPeriods = state.generalConfig.periodsPerDay;

      if (period2 + 1 >= numPeriods) return;

      const cellBelow = g[day2]?.[period2 + 1] ?? null;

      if (cellBelow && !cellBelow.isLabContinuation) return;

      g[day1][period1] = cB;
      g[day1][period1 + 1] = null;

      g[day2][period2] = cA;
      g[day2][period2 + 1] = {
        ...cA!,
        isLabContinuation: true,
      };
    }

    else if (!isLabStartA && isLabStartB) {
      const numPeriods = state.generalConfig.periodsPerDay;

      if (period1 + 1 >= numPeriods) return;

      const cellBelow = g[day1]?.[period1 + 1] ?? null;

      if (cellBelow && !cellBelow.isLabContinuation) return;

      g[day2][period2] = cA;
      g[day2][period2 + 1] = null;

      g[day1][period1] = cB;
      g[day1][period1 + 1] = {
        ...cB!,
        isLabContinuation: true,
      };
    }

    else {
      const numPeriods = state.generalConfig.periodsPerDay;

      if (
        period1 + 1 >= numPeriods ||
        period2 + 1 >= numPeriods
      ) {
        return;
      }

      const contA = g[day1][period1 + 1];
      const contB = g[day2][period2 + 1];

      g[day1][period1] = cB;
      g[day1][period1 + 1] = contB;

      g[day2][period2] = cA;
      g[day2][period2 + 1] = contA;
    }

    set({ generatedTimetables: grids });
    return;
  }

  /*
   * CROSS-DEPARTMENT MOVE
   * -----------------------------------------
   *
   * Example:
   *
   * CSE P1  --->  ECE P3
   *
   * We swap the actual cells between the
   * two department grids.
   */

  // Do not allow moving a lab into an occupied
  // continuation or vice versa.
  if (
    cA?.isLab &&
    cB?.isLabContinuation
  ) {
    return;
  }

  if (
    cB?.isLab &&
    cA?.isLabContinuation
  ) {
    return;
  }

  /*
   * Normal 1-period ↔ 1-period cross-department move
   */
  if (!isLabStartA && !isLabStartB) {
    source[day1][period1] = cB
      ? {
          ...cB,
          branchId: sourceBranchId,
          branchShortName:
            state.branches.find(
              (b) => b.id === sourceBranchId
            )?.shortName,
        }
      : null;

    target[day2][period2] = cA
      ? {
          ...cA,
          branchId: targetBranchId,
          branchShortName:
            state.branches.find(
              (b) => b.id === targetBranchId
            )?.shortName,
        }
      : null;

    set({ generatedTimetables: grids });
    return;
  }

  /*
   * Cross-department LAB moves
   *
   * For a lab, make sure the destination has two
   * consecutive periods available.
   */

  if (isLabStartA) {
    const numPeriods = state.generalConfig.periodsPerDay;

    if (period1 + 1 >= numPeriods) return;

    if (
      target[day2]?.[period2] ||
      target[day2]?.[period2 + 1]
    ) {
      return;
    }

    source[day1][period1] = cB;
    source[day1][period1 + 1] = null;

    target[day2][period2] = {
      ...cA!,
      branchId: targetBranchId,
      branchShortName:
        state.branches.find(
          (b) => b.id === targetBranchId
        )?.shortName,
      isLabContinuation: false,
    };

    target[day2][period2 + 1] = {
      ...cA!,
      branchId: targetBranchId,
      branchShortName:
        state.branches.find(
          (b) => b.id === targetBranchId
        )?.shortName,
      isLabContinuation: true,
    };

    set({ generatedTimetables: grids });
    return;
  }

  if (isLabStartB) {
    const numPeriods = state.generalConfig.periodsPerDay;

    if (period2 + 1 >= numPeriods) return;

    if (
      source[day1]?.[period1] ||
      source[day1]?.[period1 + 1]
    ) {
      return;
    }

    target[day2][period2] = cA;

    target[day2][period2 + 1] = null;

    source[day1][period1] = {
      ...cB!,
      branchId: sourceBranchId,
      branchShortName:
        state.branches.find(
          (b) => b.id === sourceBranchId
        )?.shortName,
      isLabContinuation: false,
    };

    source[day1][period1 + 1] = {
      ...cB!,
      branchId: sourceBranchId,
      branchShortName:
        state.branches.find(
          (b) => b.id === sourceBranchId
        )?.shortName,
      isLabContinuation: true,
    };

    set({ generatedTimetables: grids });
  }
},

      updateTimetables: (timetables) =>
        set({ generatedTimetables: timetables }),

      updateClass: (branchId, day, period, updates, duration) => {
          const state = get();
          const grid = cloneGrids(state.generatedTimetables);
          const current = grid[branchId]?.[day]?.[period];

          if (!current) return;
          if (current.isConfirmed) return;

          state.pushHistory();

          // Update current cell
          const edited: TimetableCell = {
              ...current,
              ...updates,
              duration,
              isLab: duration === 2,
              isLabContinuation: false,
          };

          grid[branchId][day][period] = edited;

          // ---------------------------------------
          // 1 PERIOD → 2 PERIODS
          // ---------------------------------------
          if (duration === 2) {
              const nextPeriod = period + 1;

              if (nextPeriod >= grid[branchId][day].length) {
                  set({ generatedTimetables: grid });
                  return;
              }

              const existing = grid[branchId][day][nextPeriod];
              if (existing) {
                  if (existing.isLabContinuation && nextPeriod > 0) {
                      grid[branchId][day][nextPeriod - 1] = null;
                  }
                  if (existing.duration === 2 && !existing.isLabContinuation) {
                      if (nextPeriod + 1 < grid[branchId][day].length) {
                          grid[branchId][day][nextPeriod + 1] = null;
                      }
                  }
                  grid[branchId][day][nextPeriod] = null;
              }

              grid[branchId][day][period] = {
                  ...edited,
                  duration: 2,
                  isLabContinuation: false,
              };

              grid[branchId][day][nextPeriod] = {
                  ...edited,
                  duration: 2,
                  isLabContinuation: true,
              };
          }
          // ---------------------------------------
          // 2 PERIODS → 1 PERIOD
          // ---------------------------------------
          else {
              grid[branchId][day][period] = {
                  ...edited,
                  duration: 1,
                  isLabContinuation: false,
              };

              if (
                  period + 1 < grid[branchId][day].length &&
                  grid[branchId][day][period + 1]?.isLabContinuation
              ) {
                  grid[branchId][day][period + 1] = null;
              }
          }

          set({ generatedTimetables: grid });
      },

      // --- NEW IMPLEMENTATIONS FOR MANUAL ASSIGNMENT ---

      getRemainingSubjects: (branchId) => {
        const state = get();
        const branchSubjects = state.subjects.filter((s) => s.branchIds.includes(branchId));
        const grid = state.generatedTimetables[branchId];
        
        if (!grid) return [];

        const counts: Record<string, { theory: number; practical: number }> = {};
        branchSubjects.forEach((s) => {
          counts[s.name] = { theory: 0, practical: 0 };
        });

        // Tally up assigned subjects
        for (let d = 0; d < grid.length; d++) {
          for (let p = 0; p < grid[d].length; p++) {
            const cell = grid[d][p];
            if (cell && !cell.isLabContinuation && counts[cell.subjectName]) {
              if (cell.duration === 2 || cell.isLab) {
                counts[cell.subjectName].practical += 1;
              } else {
                counts[cell.subjectName].theory += 1;
              }
            }
          }
        }

        const remaining: RemainingSubject[] = [];
        
        // Calculate remaining and generate UI objects
        branchSubjects.forEach((s) => {
          const c = counts[s.name];
          const theoryRem = s.theoryPerWeek - c.theory;
          const pracRem = s.practicalPerWeek - c.practical;

          if ((s.mode === 'theory' || s.mode === 'both') && theoryRem > 0) {
            remaining.push({
              id: `${s.id}-theory`,
              subjectName: s.name,
              subjectShortName: s.shortName,
              teacherName: s.teacherName,
              duration: 1,
              isLab: false,
              remaining: theoryRem,
            });
          }
          if ((s.mode === 'practical' || s.mode === 'both') && pracRem > 0) {
            remaining.push({
              id: `${s.id}-practical`,
              subjectName: s.name,
              subjectShortName: s.shortName,
              teacherName: s.teacherName,
              duration: 2,
              isLab: true,
              preferredLabType: s.preferredLabType,
              remaining: pracRem,
            });
          }
        });
        
        return remaining;
      },

      assignSubject: (branchId, day, period, subject, labRoomName, labRoomShortName) => {
        const state = get();
        const grid = cloneGrids(state.generatedTimetables);
        if (!grid[branchId]) return;

        // Push state to support undo/redo
        state.pushHistory();

        const branch = state.branches.find((b) => b.id === branchId);

        const newCell: TimetableCell = {
          subjectName: subject.subjectName,
          subjectShortName: subject.subjectShortName,
          teacherName: subject.teacherName,
          duration: subject.duration,
          isLab: subject.isLab,
          isCombined: false,
          combinedBranches: [],
          isLabContinuation: false,
          branchId,
          branchShortName: branch?.shortName,
          labRoomName,
          labRoomShortName,
          color: state.subjectColors[subject.subjectName] || undefined,
        };

        const targetGrid = grid[branchId];

        // Helper function to safely clear overwritten cells
        const clearCell = (d: number, p: number) => {
          const existing = targetGrid[d][p];
          if (!existing) return;
          
          if (existing.isLabContinuation && p > 0) {
             targetGrid[d][p - 1] = null; // Clear the start
          }
          if (existing.duration === 2 && !existing.isLabContinuation && p + 1 < targetGrid[d].length) {
             targetGrid[d][p + 1] = null; // Clear the continuation
          }
        };

        if (subject.duration === 1) {
          clearCell(day, period);
          targetGrid[day][period] = newCell;
          
        } else if (subject.duration === 2) {
          const nextPeriod = period + 1;
          // Prevent out of bounds
          if (nextPeriod >= targetGrid[day].length) return; 

          // Clear current and next period if they contain classes
          clearCell(day, period);
          // If the next cell was cleared by clearing the first, this is safe to run again
          clearCell(day, nextPeriod); 

          targetGrid[day][period] = newCell;
          targetGrid[day][nextPeriod] = { ...newCell, isLabContinuation: true };
        }

        set({ generatedTimetables: grid });
      },

      removeManualSubject: (branchId, day, period) => {
        // Placeholder implementation for future deletion functionality
        console.warn(`removeSubject placeholder invoked for branch ${branchId}, Day: ${day}, Period: ${period}`);
      },
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