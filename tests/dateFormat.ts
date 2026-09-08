const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
];

/** Formats a date the way this app's meeting/race grids do, e.g. "08-Sept-2026". */
export function formatAppDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTH_ABBR[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/** Formats a date the way this app's page headers display it, e.g. "08 Sept 2026". */
export function formatDisplayDate(date: Date): string {
  return formatAppDate(date).replace(/-/g, ' ');
}
