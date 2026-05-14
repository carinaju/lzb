import { formatCurrency, formatMultiplier, formatNumber } from '../utils/formatters';
import { roasBadgeClass } from '../utils/roasCalculator';

export default function CampaignTable({ rows }) {
  return (
    <div className="campaign-card card section-block">
      <div className="campaign-header-row">
        <h3>Campaign Overview</h3>
        <span className="campaign-meta">
          <strong>{rows.length}</strong> {rows.length === 1 ? 'Campaign' : 'Campaigns'}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="empty-table">No campaign data for this period.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Ad Spend</th>
              <th>Conv. Value</th>
              <th>Conversions</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.name}>
                <td className="td-name">{row.name}</td>
                <td className="td-spend">{formatCurrency(row.spend)}</td>
                <td className="td-revenue">{formatCurrency(row.conversionValue)}</td>
                <td>{formatNumber(row.conversions)}</td>
                <td>
                  <span className={`roas-badge ${roasBadgeClass(row.roas)}`}>
                    {row.roas !== null ? formatMultiplier(row.roas) : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
