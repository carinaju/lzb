import KPICard from './KPICard';
import { formatCurrency, formatMultiplier, formatNumber } from '../utils/formatters';

export default function KPICards({ kpis, prevKpis, wixConnected }) {
  const spendDelta   = prevKpis?.spend > 0       ? (kpis.spend - prevKpis.spend) / prevKpis.spend             : null;
  const revenueDelta = prevKpis?.revenue > 0     ? (kpis.revenue - prevKpis.revenue) / prevKpis.revenue       : null;
  const convDelta    = prevKpis?.conversions > 0 ? (kpis.conversions - prevKpis.conversions) / prevKpis.conversions : null;
  const aovDelta     = prevKpis?.aov > 0         ? (kpis.aov - prevKpis.aov) / prevKpis.aov                  : null;

  const adsRoas = kpis.roas ?? null;
  const adsAov  = kpis.conversions > 0 ? kpis.conversionValue / kpis.conversions : 0;

  return (
    <div className="kpi-sections">

      {/* ── All Orders ── */}
      <div className="kpi-section">
        <div className="kpi-section-label">All Orders</div>
        <div className="kpi-grid kpi-grid--3">
          <KPICard
            label="Total Revenue"
            value={wixConnected ? formatCurrency(kpis.revenue) : '—'}
            subtext={wixConnected ? 'Wix · All Channels' : 'Available after Wix setup'}
            delta={wixConnected ? revenueDelta : null}
            borderColor="green"
          />
          <KPICard
            label="Orders"
            value={wixConnected && kpis.orderCount > 0 ? formatNumber(kpis.orderCount, 0) : '—'}
            subtext={wixConnected ? 'Paid Wix Orders' : 'Available after Wix setup'}
            borderColor="green"
          />
          <KPICard
            label="Avg. Order Value"
            value={wixConnected && kpis.aov > 0 ? formatCurrency(kpis.aov, { decimals: 2 }) : '—'}
            subtext={wixConnected ? 'Total Revenue / Orders' : 'Available after Wix setup'}
            delta={wixConnected ? aovDelta : null}
            borderColor="green"
          />
        </div>
      </div>

      {/* ── Google Ads ── */}
      <div className="kpi-section">
        <div className="kpi-section-label">Google Ads</div>
        <div className="kpi-grid kpi-grid--4">
          <KPICard
            label="Ad Spend"
            value={formatCurrency(kpis.spend)}
            subtext="Google Ads Budget"
            delta={spendDelta}
            borderColor="none"
            lowerIsBetter
          />
          <KPICard
            label="Conv. Value"
            value={kpis.conversionValue > 0 ? formatCurrency(kpis.conversionValue) : '—'}
            subtext="Ads-attributed Revenue"
            borderColor="purple"
          />
          <KPICard
            label="Conversions"
            value={kpis.conversions > 0 ? formatNumber(kpis.conversions, 1) : '—'}
            subtext="Google Ads (calculated)"
            delta={convDelta}
            borderColor="purple"
          />
          <KPICard
            label="ROAS"
            value={adsRoas !== null ? formatMultiplier(adsRoas) : '—'}
            subtext="Conv. Value / Ad Spend"
            borderColor="purple"
          />
        </div>
      </div>

    </div>
  );
}
