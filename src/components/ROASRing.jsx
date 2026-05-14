import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { formatMultiplier } from '../utils/formatters';

const ROAS_VISUAL_CAP = 20;

export default function ROASRing({ roas, label = 'This Period' }) {
  const fill = roas !== null ? Math.min((roas / ROAS_VISUAL_CAP) * 100, 100) : 0;
  const displayValue = roas !== null ? formatMultiplier(roas) : '—';

  const data = [
    { name: 'fill', value: fill, fill: 'url(#roasGrad)' },
    { name: 'track', value: 100, fill: '#f0eeeb' },
  ];

  return (
    <div className="roas-card card">
      <h3>ROAS</h3>
      <p className="sub">Return on Ad Spend</p>
      <div className="roas-ring-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="68%" outerRadius="92%"
            startAngle={210} endAngle={-30}
            data={data}
            barSize={14}
          >
            <defs>
              <linearGradient id="roasGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#96b487" />
                <stop offset="100%" stopColor="#c3b4d2" />
              </linearGradient>
            </defs>
            <RadialBar dataKey="value" background={false} isAnimationActive />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="roas-center">
          <span className="roas-number">{displayValue}</span>
          <span className="roas-label">{label}</span>
        </div>
      </div>
      <p className="roas-tagline">
        Every €1 spent generated{' '}
        <strong>{roas !== null ? `${roas.toFixed(2)}×` : '—'}</strong> in revenue.
      </p>
    </div>
  );
}
