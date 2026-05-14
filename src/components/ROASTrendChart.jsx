import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const OVERALL_COLOR = '#6a8f5c';
const CAMPAIGN_COLORS = ['#c3b4d2', '#96b487', '#8a6fa8', '#b7950b', '#c0392b', '#2980b9', '#e67e22', '#16a085', '#8e44ad', '#d35400'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e4e0da',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#1e1e1e' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value !== null ? `${Number(p.value).toFixed(2)}×` : '—'}</strong>
        </div>
      ))}
    </div>
  );
}

export default function ROASTrendChart({ trendData }) {
  // Collect all unique campaign names across trend data
  const campaignNames = useMemo(() => {
    const names = new Set();
    for (const point of trendData) {
      for (const name of (point.campaigns?.keys?.() ?? [])) {
        if (name.includes('PM')) names.add(name);
      }
    }
    return [...names];
  }, [trendData]);

  const [visibleCampaigns, setVisibleCampaigns] = useState(new Set());

  const toggle = name => setVisibleCampaigns(prev => {
    const next = new Set(prev);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });

  // Flatten campaign ROAS into each data point
  const chartData = trendData.map(point => {
    const obj = { label: point.label, overall: point.roas };
    for (const name of campaignNames) {
      const camp = point.campaigns?.get?.(name);
      const campRoas = camp && camp.spend > 0 ? camp.conversionValue / camp.spend : null;
      obj[name] = campRoas;
    }
    return obj;
  });

  return (
    <div className="trend-card card">
      <h3>ROAS Trend</h3>
      <p className="sub">Google Ads Conv. Value / Ad Spend — per month</p>

      {campaignNames.length > 0 && (
        <div className="chart-legend">
          <button
            className="legend-btn active"
            style={{ pointerEvents: 'none' }}
          >
            <span className="legend-dot" style={{ background: OVERALL_COLOR }} />
            Overall
          </button>
          {campaignNames.map((name, i) => (
            <button
              key={name}
              className={`legend-btn ${visibleCampaigns.has(name) ? 'active' : ''}`}
              onClick={() => toggle(name)}
            >
              <span
                className="legend-dot"
                style={{ background: CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length] }}
              />
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e0da" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888884', fontFamily: 'var(--font-sans)' }} />
            <YAxis
              tickFormatter={v => `${v.toFixed(1)}×`}
              tick={{ fontSize: 11, fill: '#888884', fontFamily: 'var(--font-sans)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={1} stroke="#c0392b" strokeDasharray="4 4" strokeOpacity={0.5} />
            <ReferenceLine y={2} stroke="#b7950b" strokeDasharray="4 4" strokeOpacity={0.4} />
            <Line
              type="monotone"
              dataKey="overall"
              name="Google Ads ROAS"
              stroke={OVERALL_COLOR}
              strokeWidth={2.5}
              dot={{ r: 4, fill: OVERALL_COLOR }}
              activeDot={{ r: 6 }}
              connectNulls
            />
            {campaignNames.map((name, i) =>
              visibleCampaigns.has(name) ? (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  name={name}
                  stroke={CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length]}
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  dot={false}
                  connectNulls
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
