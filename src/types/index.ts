export interface GeneralConfig {
  periodsPerDay: number;
  periodDuration: number;
  startTime: string;
  recessAfterPeriod: number;
  recessDuration: number;
  workingDays: string[];
}

export interface Branch {
  id: string;
  name: string;
  shortName: string;
}

export interface LabRoom {
  id: string;
  name: string;
  shortName: string;
  capacity: number;
  labType: LabType;
}

export type LabType =
  | 'Computer Lab'
  | 'Electronics Lab'
  | 'Chemistry Lab'
  | 'Physics Lab'
  | 'Mechanical Lab'
  | 'Civil Lab'
  | 'Biology Lab'
  | 'General Lab';

export const LAB_TYPES: LabType[] = [
  'Computer Lab',
  'Electronics Lab',
  'Chemistry Lab',
  'Physics Lab',
  'Mechanical Lab',
  'Civil Lab',
  'Biology Lab',
  'General Lab',
];

export type SubjectMode = 'theory' | 'practical' | 'both';

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  teacherName: string;
  branchIds: string[];
  mode: SubjectMode;
  theoryPerWeek: number;
  practicalPerWeek: number;
  preferredLabType?: LabType;
  color?: string;
  // Legacy compat
  branchId?: string;
  isLab?: boolean;
  lecturesPerWeek?: number;
}

export interface CombinedClass {
  id: string;
  subjectName: string;
  shortName: string;
  teacherName: string;
  branchIds: string[];
  isLab: boolean;
  lecturesPerWeek: number;
}

/** A class that must be placed at a specific slot — never moved by regeneration */
export interface ConfirmedClass {
  id: string;
  subjectName: string;
  shortName: string;
  teacherName: string;
  branchId: string;
  dayIndex: number;
  periodIndex: number;
  isLab: boolean;
  color?: string;
}

export interface TimetableCell {
  subjectName: string;
  subjectShortName: string;
  teacherName: string;
  isLab: boolean;
  isCombined: boolean;
  combinedBranches: string[];
  isLabContinuation: boolean;
  isConfirmed?: boolean;
  branchId?: string;
  branchShortName?: string;
  labRoomName?: string;
  labRoomShortName?: string;
  color?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface GenerationResult {
  timetables: Record<string, (TimetableCell | null)[][]>;
  warnings: string[];
  success: boolean;
}

export interface SavedTimetable {
  id: string;
  name: string;
  createdAt: string;
  config: GeneralConfig;
  branches: Branch[];
  subjects: Subject[];
  combinedClasses: CombinedClass[];
  confirmedClasses: ConfirmedClass[];
  labRooms: LabRoom[];
  timetables: Record<string, (TimetableCell | null)[][]>;
  warnings: string[];
  subjectColors: Record<string, string>;
}

export type ViewMode = 'branch' | 'teacher' | 'subject' | 'all-departments' | 'lab';

export interface DragPayload {
  branchId: string;
  dayIndex: number;
  periodIndex: number;
}

export const SUBJECT_PALETTE = [
  '#0d9488', '#d97706', '#e11d48', '#7c3aed', '#059669',
  '#0284c7', '#c026d3', '#ea580c', '#4f46e5', '#65a30d',
  '#0891b2', '#db2777', '#9333ea', '#16a34a', '#2563eb',
  '#e5383b', '#f97316', '#06b6d4', '#8b5cf6', '#84cc16',
];
