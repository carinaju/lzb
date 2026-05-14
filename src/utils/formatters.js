export function formatCurrency(value, opts = {}) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const { decimals = 0 } = opts;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatMultiplier(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${value.toFixed(decimals)}×`;
}

export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDelta(delta) {
  if (delta === null || delta === undefined || isNaN(delta) || !isFinite(delta)) {
    return { text: null, positive: null };
  }
  const pct = Math.abs(delta * 100).toFixed(1);
  const positive = delta >= 0;
  const arrow = positive ? '↑' : '↓';
  return { text: `${arrow} ${pct}%`, positive };
}
