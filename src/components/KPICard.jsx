import { formatDelta } from '../utils/formatters';

export default function KPICard({ label, value, subtext, delta, borderColor = 'none', lowerIsBetter = false }) {
  const { text: deltaText, positive: deltaPositive } = formatDelta(delta);
  const isGood = lowerIsBetter ? !deltaPositive : deltaPositive;

  return (
    <div className={`kpi-card border-${borderColor}`}>
      <div className="label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-bottom">
        {subtext && <span className="kpi-subtext">{subtext}</span>}
        {deltaText && (
          <span className={`delta ${isGood ? 'positive' : 'negative'}`}>
            {deltaText}
          </span>
        )}
      </div>
    </div>
  );
}
