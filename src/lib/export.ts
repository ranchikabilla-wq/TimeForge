import type { TimetableCell, GeneralConfig, Branch } from '@/types';
import { parseTime, formatTime } from '@/lib/utils';

function calculateTimeSlots(config: GeneralConfig) {
  const slots: { start: string; end: string }[] = [];
  let currentMinutes = parseTime(config.startTime);
  for (let p = 0; p < config.periodsPerDay; p++) {
    if (p === config.recessAfterPeriod) currentMinutes += config.recessDuration;
    const start = formatTime(currentMinutes);
    currentMinutes += config.periodDuration;
    slots.push({ start, end: formatTime(currentMinutes) });
  }
  return slots;
}

export function exportPDF() { window.print(); }

export function exportExcel(
  timetables: Record<string, (TimetableCell | null)[][]>,
  branches: Branch[],
  config: GeneralConfig
) {
  const timeSlots = calculateTimeSlots(config);
  const numDays = config.workingDays.length;
  const numPeriods = config.periodsPerDay;

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"/>
    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>`;

  for (const branch of branches) {
    html += `<x:ExcelWorksheet><x:Name>${branch.shortName}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>`;
  }
  html += `<x:ExcelWorksheet><x:Name>All Departments</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>`;
  html += `</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    <style>
      table{border-collapse:collapse}
      td,th{border:1px solid #333;padding:6px 10px;font-family:Calibri,sans-serif;font-size:11pt;text-align:center}
      th{background:#1a3a4a;color:white;font-weight:bold}
      .recess{background:#FFF3CD;font-weight:bold;color:#856404}
      .lab{background:#E0F2FE}
      .combined{background:#FEF3C7}
      .empty{background:#F9FAFB;color:#9CA3AF}
      .header{font-size:14pt;font-weight:bold;padding:8px}
    </style></head><body>`;

  for (const branch of branches) {
    const grid = timetables[branch.id];
    if (!grid) continue;
    html += `<div id="${branch.shortName}"><table>`;
    html += `<tr><td colspan="${numPeriods + 2}" class="header">${branch.name} (${branch.shortName}) — Timetable</td></tr>`;
    html += `<tr><th>Day</th>`;
    for (let p = 0; p < numPeriods; p++) {
      if (p === config.recessAfterPeriod) html += `<th class="recess">Recess</th>`;
      html += `<th>P${p + 1}<br/>${timeSlots[p]?.start}—${timeSlots[p]?.end}</th>`;
    }
    html += `</tr>`;
    for (let d = 0; d < numDays; d++) {
      html += `<tr><td><b>${config.workingDays[d]}</b></td>`;
      for (let p = 0; p < numPeriods; p++) {
        if (p === config.recessAfterPeriod) html += `<td class="recess"></td>`;
        const cell = grid[d]?.[p];
        if (!cell) { html += `<td class="empty">—</td>`; }
        else if (cell.isLabContinuation) { continue; }
        else {
          const colspan = cell.isLab ? 2 : 1;
          const cls = cell.isLab ? 'lab' : cell.isCombined ? 'combined' : '';
          const extra = cell.isLab ? ' [LAB]' : cell.isCombined ? ` [${cell.combinedBranches.join('+')}]` : '';
          const labInfo = cell.labRoomShortName ? ` (${cell.labRoomShortName})` : '';
          html += `<td colspan="${colspan}" class="${cls}"><b>${cell.subjectShortName}</b>${extra}${labInfo}<br/>${cell.teacherName}</td>`;
        }
      }
      html += `</tr>`;
    }
    html += `</table><br/></div>`;
  }

  // All departments
  html += `<div id="All Departments"><table>`;
  html += `<tr><td colspan="${2 + numPeriods}" class="header">All Departments — Master Timetable</td></tr>`;
  html += `<tr><th>Day</th><th>Branch</th>`;
  for (let p = 0; p < numPeriods; p++) {
    if (p === config.recessAfterPeriod) html += `<th class="recess">R</th>`;
    html += `<th>P${p + 1}<br/>${timeSlots[p]?.start}—${timeSlots[p]?.end}</th>`;
  }
  html += `</tr>`;
  for (let d = 0; d < numDays; d++) {
    for (let bIdx = 0; bIdx < branches.length; bIdx++) {
      const branch = branches[bIdx];
      html += `<tr>`;
      if (bIdx === 0) html += `<td rowspan="${branches.length}"><b>${config.workingDays[d]}</b></td>`;
      html += `<td><b>${branch.shortName}</b></td>`;
      for (let p = 0; p < numPeriods; p++) {
        if (p === config.recessAfterPeriod) html += `<td class="recess"></td>`;
        const cell = timetables[branch.id]?.[d]?.[p];
        if (!cell) { html += `<td class="empty">—</td>`; }
        else if (cell.isLabContinuation) { continue; }
        else {
          const colspan = cell.isLab ? 2 : 1;
          const cls = cell.isLab ? 'lab' : cell.isCombined ? 'combined' : '';
          html += `<td colspan="${colspan}" class="${cls}"><b>${cell.subjectShortName}</b><br/>${cell.teacherName}</td>`;
        }
      }
      html += `</tr>`;
    }
  }
  html += `</table></div></body></html>`;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Timetable_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function extractTeachers(
  timetables: Record<string, (TimetableCell | null)[][]>,
  branches: Branch[]
): string[] {
  const set = new Set<string>();
  for (const branch of branches) {
    const grid = timetables[branch.id];
    if (!grid) continue;
    for (const daySlots of grid) {
      for (const cell of daySlots) {
        if (cell && !cell.isLabContinuation) set.add(cell.teacherName);
      }
    }
  }
  return Array.from(set).sort();
}

export function extractSubjects(
  timetables: Record<string, (TimetableCell | null)[][]>,
  branches: Branch[]
): string[] {
  const set = new Set<string>();
  for (const branch of branches) {
    const grid = timetables[branch.id];
    if (!grid) continue;
    for (const daySlots of grid) {
      for (const cell of daySlots) {
        if (cell && !cell.isLabContinuation) set.add(cell.subjectName);
      }
    }
  }
  return Array.from(set).sort();
}
