import type {
  GeneralConfig,
  Branch,
  Subject,
  CombinedClass,
  ConfirmedClass,
  TimetableCell,
  GenerationResult,
  LabRoom,
} from '@/types';
import { shuffle } from '@/lib/utils';

export function generateTimetables(
  config: GeneralConfig,
  branches: Branch[],
  subjects: Subject[],
  combinedClasses: CombinedClass[],
  confirmedClasses: ConfirmedClass[] = [],
  labRooms: LabRoom[] = [],
  subjectColors: Record<string, string> = {}
): GenerationResult {
  const numDays = config.workingDays.length;
  const numPeriods = config.periodsPerDay;
  const warnings: string[] = [];

  const grids: Record<string, (TimetableCell | null)[][]> = {};
  branches.forEach((b) => {
    const grid: (TimetableCell | null)[][] = [];
    for (let d = 0; d < numDays; d++) {
      grid[d] = new Array(numPeriods).fill(null);
    }
    grids[b.id] = grid;
  });

  const teacherSchedule: Record<string, Set<string>> = {};
  const labRoomSchedule: Record<string, Set<string>> = {};

  function markTeacher(teacher: string, day: number, period: number) {
    const key = teacher.toLowerCase().trim();
    if (!teacherSchedule[key]) teacherSchedule[key] = new Set();
    teacherSchedule[key].add(`${day}-${period}`);
  }

  function isTeacherFree(teacher: string, day: number, period: number): boolean {
    const key = teacher.toLowerCase().trim();
    return !teacherSchedule[key]?.has(`${day}-${period}`);
  }

  function isBranchFree(branchId: string, day: number, period: number): boolean {
    return grids[branchId]?.[day]?.[period] === null;
  }

  function crossesRecess(period: number): boolean {
    return period === config.recessAfterPeriod - 1;
  }

  function markLabRoom(labId: string, day: number, period: number) {
    if (!labRoomSchedule[labId]) labRoomSchedule[labId] = new Set();
    labRoomSchedule[labId].add(`${day}-${period}`);
  }

  function isLabRoomFree(labId: string, day: number, period: number): boolean {
    return !labRoomSchedule[labId]?.has(`${day}-${period}`);
  }

  function findAvailableLab(preferredType: string | undefined, day: number, period: number, periods: number): LabRoom | null {
    if (labRooms.length === 0) return null;
    const preferred = labRooms.filter((l) => l.labType === preferredType);
    const others = labRooms.filter((l) => l.labType !== preferredType);
    const candidates = [...shuffle(preferred), ...shuffle(others)];
    for (const lab of candidates) {
      let allFree = true;
      for (let i = 0; i < periods; i++) {
        if (!isLabRoomFree(lab.id, day, period + i)) { allFree = false; break; }
      }
      if (allFree) return lab;
    }
    return null;
  }

  function makeCell(
    name: string,
    shortName: string,
    teacher: string,
    isLab: boolean,
    isCombined: boolean,
    combinedBranches: string[],
    isContinuation: boolean,
    labRoom?: LabRoom | null,
    color?: string,
    confirmed?: boolean
  ): TimetableCell {
    return {
      subjectName: name,
      subjectShortName: shortName,
      teacherName: teacher,
      isLab,
      isCombined,
      combinedBranches,
      isLabContinuation: isContinuation,
      labRoomName: labRoom?.name,
      labRoomShortName: labRoom?.shortName,
      color: color || subjectColors[name],
      isConfirmed: confirmed || false,
    };
  }

  // ─── 0) Place confirmed / fixed classes first ───
  for (const cc of confirmedClasses) {
    if (!grids[cc.branchId]) {
      warnings.push(`Confirmed "${cc.subjectName}": branch not found`);
      continue;
    }
    const d = cc.dayIndex;
    const p = cc.periodIndex;

    if (d < 0 || d >= numDays || p < 0 || p >= numPeriods) {
      warnings.push(`Confirmed "${cc.subjectName}": slot (day ${d + 1}, period ${p + 1}) out of range`);
      continue;
    }

    if (!isBranchFree(cc.branchId, d, p)) {
      warnings.push(`Confirmed "${cc.subjectName}": slot (${config.workingDays[d]} P${p + 1}) already occupied`);
      continue;
    }

    if (cc.isLab) {
      if (p + 1 >= numPeriods) {
        warnings.push(`Confirmed lab "${cc.subjectName}": no room for 2-period block at P${p + 1}`);
        continue;
      }
      if (!isBranchFree(cc.branchId, d, p + 1)) {
        warnings.push(`Confirmed lab "${cc.subjectName}": continuation slot (${config.workingDays[d]} P${p + 2}) occupied`);
        continue;
      }

      const color = cc.color || subjectColors[cc.subjectName];
      grids[cc.branchId][d][p] = makeCell(cc.subjectName, cc.shortName, cc.teacherName, true, false, [], false, null, color, true);
      grids[cc.branchId][d][p + 1] = makeCell(cc.subjectName, cc.shortName, cc.teacherName, true, false, [], true, null, color, true);
      markTeacher(cc.teacherName, d, p);
      markTeacher(cc.teacherName, d, p + 1);
    } else {
      const color = cc.color || subjectColors[cc.subjectName];
      grids[cc.branchId][d][p] = makeCell(cc.subjectName, cc.shortName, cc.teacherName, false, false, [], false, null, color, true);
      markTeacher(cc.teacherName, d, p);
    }
  }

  // 1) Place combined classes
  for (const cc of combinedClasses) {
    const validBranches = cc.branchIds.filter((bid) => grids[bid]);
    if (validBranches.length < 2) continue;

    const sessionsNeeded = cc.isLab ? Math.ceil(cc.lecturesPerWeek / 2) : cc.lecturesPerWeek;
    let placed = 0;

    const branchNames = validBranches.map(
      (bid) => branches.find((b) => b.id === bid)?.shortName ?? ''
    );
    const dayOrder = shuffle(Array.from({ length: numDays }, (_, i) => i));

    for (const d of dayOrder) {
      if (placed >= sessionsNeeded) break;
      const periodOrder = shuffle(Array.from({ length: numPeriods }, (_, i) => i));

      for (const p of periodOrder) {
        if (placed >= sessionsNeeded) break;
        if (cc.isLab && p + 1 >= numPeriods) continue;
        if (cc.isLab && crossesRecess(p)) continue;

        const allFree = validBranches.every((bid) => {
          if (!isBranchFree(bid, d, p)) return false;
          if (cc.isLab && !isBranchFree(bid, d, p + 1)) return false;
          return true;
        });
        if (!allFree) continue;

        if (!isTeacherFree(cc.teacherName, d, p)) continue;
        if (cc.isLab && !isTeacherFree(cc.teacherName, d, p + 1)) continue;

        let labRoom: LabRoom | null = null;
        if (cc.isLab && labRooms.length > 0) {
          labRoom = findAvailableLab(undefined, d, p, 2);
          if (!labRoom) continue;
        }

        validBranches.forEach((bid) => {
          const color = subjectColors[cc.subjectName];
          grids[bid][d][p] = makeCell(cc.subjectName, cc.shortName, cc.teacherName, cc.isLab, true, branchNames, false, labRoom, color);
          if (cc.isLab) {
            grids[bid][d][p + 1] = makeCell(cc.subjectName, cc.shortName, cc.teacherName, cc.isLab, true, branchNames, true, labRoom, color);
          }
        });

        markTeacher(cc.teacherName, d, p);
        if (cc.isLab) markTeacher(cc.teacherName, d, p + 1);
        if (labRoom) {
          markLabRoom(labRoom.id, d, p);
          if (cc.isLab) markLabRoom(labRoom.id, d, p + 1);
        }
        placed++;
      }
    }

    if (placed < sessionsNeeded) {
      warnings.push(`Combined "${cc.subjectName}": placed ${cc.isLab ? placed * 2 : placed}/${cc.lecturesPerWeek} lectures`);
    }
  }

  // Expand smart subjects into branch-specific entries
  interface ExpandedSubject {
    name: string;
    shortName: string;
    teacherName: string;
    branchId: string;
    isLab: boolean;
    lecturesPerWeek: number;
    preferredLabType?: string;
    color?: string;
  }

  const expandedSubjects: ExpandedSubject[] = [];

  for (const sub of subjects) {
    const targetBranches = sub.branchIds?.length > 0 ? sub.branchIds : (sub.branchId ? [sub.branchId] : []);

    for (const bid of targetBranches) {
      if (sub.mode === 'theory' || sub.mode === 'both') {
        const lecs = sub.theoryPerWeek ?? sub.lecturesPerWeek ?? 3;
        expandedSubjects.push({
          name: sub.name,
          shortName: sub.shortName,
          teacherName: sub.teacherName,
          branchId: bid,
          isLab: false,
          lecturesPerWeek: lecs,
          color: sub.color,
        });
      }
      if (sub.mode === 'practical' || sub.mode === 'both') {
        const pracs = sub.practicalPerWeek ?? (sub.isLab ? (sub.lecturesPerWeek ?? 2) : 2);
        expandedSubjects.push({
          name: sub.mode === 'both' ? `${sub.name} Lab` : sub.name,
          shortName: sub.mode === 'both' ? `${sub.shortName}-L` : sub.shortName,
          teacherName: sub.teacherName,
          branchId: bid,
          isLab: true,
          lecturesPerWeek: pracs,
          preferredLabType: sub.preferredLabType,
          color: sub.color,
        });
      }
    }
  }

  // 2) Place lab subjects (expanded)
  const labSubjects = shuffle(expandedSubjects.filter((s) => s.isLab));
  for (const sub of labSubjects) {
    if (!grids[sub.branchId]) continue;
    const sessionsNeeded = Math.ceil(sub.lecturesPerWeek / 2);
    let placed = 0;
    const dayOrder = shuffle(Array.from({ length: numDays }, (_, i) => i));

    for (const d of dayOrder) {
      if (placed >= sessionsNeeded) break;
      const periodOrder = shuffle(Array.from({ length: numPeriods - 1 }, (_, i) => i));

      for (const p of periodOrder) {
        if (placed >= sessionsNeeded) break;
        if (crossesRecess(p)) continue;
        if (!isBranchFree(sub.branchId, d, p)) continue;
        if (!isBranchFree(sub.branchId, d, p + 1)) continue;
        if (!isTeacherFree(sub.teacherName, d, p)) continue;
        if (!isTeacherFree(sub.teacherName, d, p + 1)) continue;

        let labRoom: LabRoom | null = null;
        if (labRooms.length > 0) {
          labRoom = findAvailableLab(sub.preferredLabType, d, p, 2);
          if (!labRoom) continue;
        }

        const color = sub.color || subjectColors[sub.name];
        grids[sub.branchId][d][p] = makeCell(sub.name, sub.shortName, sub.teacherName, true, false, [], false, labRoom, color);
        grids[sub.branchId][d][p + 1] = makeCell(sub.name, sub.shortName, sub.teacherName, true, false, [], true, labRoom, color);
        markTeacher(sub.teacherName, d, p);
        markTeacher(sub.teacherName, d, p + 1);
        if (labRoom) {
          markLabRoom(labRoom.id, d, p);
          markLabRoom(labRoom.id, d, p + 1);
        }
        placed++;
      }
    }

    if (placed < sessionsNeeded) {
      const branchName = branches.find((b) => b.id === sub.branchId)?.shortName ?? '';
      warnings.push(`Lab "${sub.name}" (${branchName}): placed ${placed * 2}/${sub.lecturesPerWeek} lectures`);
    }
  }

  // 3) Place regular subjects (expanded)
  const regularSubjects = shuffle(expandedSubjects.filter((s) => !s.isLab));
  for (const sub of regularSubjects) {
    if (!grids[sub.branchId]) continue;
    let placed = 0;
    const daysUsed = new Set<number>();
    const dayOrder = shuffle(Array.from({ length: numDays }, (_, i) => i));

    for (const d of dayOrder) {
      if (placed >= sub.lecturesPerWeek) break;
      if (daysUsed.has(d)) continue;

      const periodOrder = shuffle(Array.from({ length: numPeriods }, (_, i) => i));
      for (const p of periodOrder) {
        if (placed >= sub.lecturesPerWeek) break;
        if (!isBranchFree(sub.branchId, d, p)) continue;
        if (!isTeacherFree(sub.teacherName, d, p)) continue;

        const color = sub.color || subjectColors[sub.name];
        grids[sub.branchId][d][p] = makeCell(sub.name, sub.shortName, sub.teacherName, false, false, [], false, null, color);
        markTeacher(sub.teacherName, d, p);
        placed++;
        daysUsed.add(d);
        break;
      }
    }

    if (placed < sub.lecturesPerWeek) {
      for (const d of dayOrder) {
        if (placed >= sub.lecturesPerWeek) break;
        const periodOrder = shuffle(Array.from({ length: numPeriods }, (_, i) => i));
        for (const p of periodOrder) {
          if (placed >= sub.lecturesPerWeek) break;
          if (!isBranchFree(sub.branchId, d, p)) continue;
          if (!isTeacherFree(sub.teacherName, d, p)) continue;

          const color = sub.color || subjectColors[sub.name];
          grids[sub.branchId][d][p] = makeCell(sub.name, sub.shortName, sub.teacherName, false, false, [], false, null, color);
          markTeacher(sub.teacherName, d, p);
          placed++;
        }
      }
    }

    if (placed < sub.lecturesPerWeek) {
      const branchName = branches.find((b) => b.id === sub.branchId)?.shortName ?? '';
      warnings.push(`"${sub.name}" (${branchName}): placed ${placed}/${sub.lecturesPerWeek} lectures`);
    }
  }

  return {
    timetables: grids,
    warnings,
    success: warnings.length === 0,
  };
}
