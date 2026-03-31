import type { GeneralConfig, LabType } from '@/types';

export const DEFAULT_CONFIG: GeneralConfig = {
  periodsPerDay: 7,
  periodDuration: 50,
  startTime: '09:00',
  recessAfterPeriod: 4,
  recessDuration: 30,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

export const ALL_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const CELL_COLOR_MAP: Record<number, { bg: string; border: string; text: string; printClass: string }> = {
  0:  { bg: 'bg-teal-500/20',    border: 'border-l-teal-400',    text: 'text-teal-300',    printClass: 'print-cell-normal' },
  1:  { bg: 'bg-amber-500/20',   border: 'border-l-amber-400',   text: 'text-amber-300',   printClass: 'print-cell-normal' },
  2:  { bg: 'bg-rose-500/20',    border: 'border-l-rose-400',    text: 'text-rose-300',    printClass: 'print-cell-normal' },
  3:  { bg: 'bg-violet-500/20',  border: 'border-l-violet-400',  text: 'text-violet-300',  printClass: 'print-cell-normal' },
  4:  { bg: 'bg-emerald-500/20', border: 'border-l-emerald-400', text: 'text-emerald-300', printClass: 'print-cell-normal' },
  5:  { bg: 'bg-sky-500/20',     border: 'border-l-sky-400',     text: 'text-sky-300',     printClass: 'print-cell-normal' },
  6:  { bg: 'bg-fuchsia-500/20', border: 'border-l-fuchsia-400', text: 'text-fuchsia-300', printClass: 'print-cell-normal' },
  7:  { bg: 'bg-orange-500/20',  border: 'border-l-orange-400',  text: 'text-orange-300',  printClass: 'print-cell-normal' },
  8:  { bg: 'bg-indigo-500/20',  border: 'border-l-indigo-400',  text: 'text-indigo-300',  printClass: 'print-cell-normal' },
  9:  { bg: 'bg-lime-500/20',    border: 'border-l-lime-400',    text: 'text-lime-300',    printClass: 'print-cell-normal' },
  10: { bg: 'bg-cyan-500/20',    border: 'border-l-cyan-400',    text: 'text-cyan-300',    printClass: 'print-cell-normal' },
  11: { bg: 'bg-pink-500/20',    border: 'border-l-pink-400',    text: 'text-pink-300',    printClass: 'print-cell-normal' },
};

export const STEP_LABELS = [
  'Configuration',
  'Branches',
  'Labs',
  'Subjects',
  'Combined Classes',
  'Confirmed Classes',
  'Review & Generate',
];

export const STEP_ICONS_MAP = [
  'settings',
  'branches',
  'labs',
  'subjects',
  'combined',
  'confirmed',
  'review',
] as const;

export const LAB_TYPE_ICONS: Record<LabType, string> = {
  'Computer Lab': '💻',
  'Electronics Lab': '🔌',
  'Chemistry Lab': '🧪',
  'Physics Lab': '⚡',
  'Mechanical Lab': '⚙️',
  'Civil Lab': '🏗️',
  'Biology Lab': '🧬',
  'General Lab': '🔬',
};

export function getSubjectColorIndex(subjectName: string): number {
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % Object.keys(CELL_COLOR_MAP).length;
}
