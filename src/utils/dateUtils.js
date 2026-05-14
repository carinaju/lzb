export function getMonthKey(month, year) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function monthLabel(month, year) {
  const names = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${names[month]} ${year}`;
}

export function shortMonthLabel(month) {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names[month];
}

export function prevMonth(month, year) {
  if (month === 0) return { month: 11, year: year - 1 };
  return { month: month - 1, year };
}

export function nextMonth(month, year) {
  if (month === 11) return { month: 0, year: year + 1 };
  return { month: month + 1, year };
}

export function parseDateString(str) {
  if (!str) return null;
  const trimmed = str.trim();
  // ISO: 2025-01-15
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, m, day] = trimmed.split('-').map(Number);
    return { month: m - 1, year, day };
  }
  // DD.MM.YYYY
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(trimmed)) {
    const [day, m, year] = trimmed.split('.').map(Number);
    if (m >= 1 && m <= 12) return { month: m - 1, year, day };
  }
  // DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [day, m, year] = trimmed.split('/').map(Number);
    if (m >= 1 && m <= 12) return { month: m - 1, year, day };
  }
  return null;
}

export function isoToMonthKey(iso) {
  if (!iso) return null;
  return iso.substring(0, 7); // 'YYYY-MM'
}

export function formatISODate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${months[m - 1]} ${y}`;
}

export function dateRangeLabel(start, end) {
  if (!start && !end) return '';
  if (!end || start === end) return formatISODate(start);
  return `${formatISODate(start)} – ${formatISODate(end)}`;
}
