import { useMemo } from 'react';
import type { TimetableCell, GeneralConfig, Branch } from '@/types';
import TimetableGrid from '@/components/features/TimetableGrid';

interface SubjectViewProps {
  timetables: Record<string, (TimetableCell | null)[][]>;
  branches: Branch[];
  config: GeneralConfig;
  selectedSubject: string;
}

export default function SubjectView({ timetables, branches, config, selectedSubject }: SubjectViewProps) {
  const subjectGrid = useMemo(() => {
    const numDays = config.workingDays.length;
    const numPeriods = config.periodsPerDay;
    const grid: (TimetableCell | null)[][] = [];
    for (let d = 0; d < numDays; d++) grid[d] = new Array(numPeriods).fill(null);
    const subKey = selectedSubject.toLowerCase().trim();
    for (const branch of branches) {
      const branchGrid = timetables[branch.id];
      if (!branchGrid) continue;
      for (let d = 0; d < numDays; d++) {
        for (let p = 0; p < numPeriods; p++) {
          const cell = branchGrid[d]?.[p];
          if (cell && cell.subjectName.toLowerCase().trim() === subKey && !cell.isLabContinuation) {
            if (!grid[d][p]) {
              grid[d][p] = { ...cell, branchShortName: branch.shortName };
              if (cell.isLab && p + 1 < numPeriods) grid[d][p + 1] = { ...cell, isLabContinuation: true, branchShortName: branch.shortName };
            }
          }
        }
      }
    }
    return grid;
  }, [timetables, branches, config, selectedSubject]);

  return <TimetableGrid grid={subjectGrid} config={config} branchName={`Subject: ${selectedSubject}`} />;
}
