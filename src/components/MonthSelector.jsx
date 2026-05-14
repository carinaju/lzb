import { monthLabel, prevMonth, nextMonth, getMonthKey } from '../utils/dateUtils';

export default function MonthSelector({
  month, year, viewMode, dateRange, availableMonths,
  onMonthChange, onViewModeChange, onDateRangeChange,
}) {
  const prev = prevMonth(month, year);
  const next = nextMonth(month, year);
  const hasPrev = availableMonths.has(getMonthKey(prev.month, prev.year));
  const hasNext = availableMonths.has(getMonthKey(next.month, next.year));

  return (
    <div className="month-selector">
      {viewMode !== 'custom' ? (
        <div className="month-nav">
          <button onClick={() => onMonthChange(prev.month, prev.year)} disabled={!hasPrev} aria-label="Previous month">‹</button>
          <span className="month-name">{monthLabel(month, year)}</span>
          <button onClick={() => onMonthChange(next.month, next.year)} disabled={!hasNext} aria-label="Next month">›</button>
        </div>
      ) : (
        <div className="date-range-inputs">
          <div className="date-range-field">
            <label>From</label>
            <input
              type="date"
              value={dateRange.start || ''}
              onChange={e => onDateRangeChange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <span className="date-range-sep">→</span>
          <div className="date-range-field">
            <label>To</label>
            <input
              type="date"
              value={dateRange.end || ''}
              onChange={e => onDateRangeChange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      )}
      <div className="view-toggle">
        {[
          { mode: 'monthly', label: 'Month' },
          { mode: 'ytd', label: 'YTD' },
          { mode: 'custom', label: 'Custom' },
        ].map(({ mode, label }) => (
          <button
            key={mode}
            className={viewMode === mode ? 'active' : ''}
            onClick={() => onViewModeChange(mode)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
