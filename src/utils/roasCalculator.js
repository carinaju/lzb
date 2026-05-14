import { getMonthKey, shortMonthLabel } from './dateUtils';

// ROAS is always: Google Ads Conversion Value / Ad Spend.
// Total Wix revenue is shown separately as "All Orders" — it is NOT used
// in ROAS calculations because it includes organic, social, email, etc.

const _now = new Date();
const CURRENT_MONTH_KEY = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}`;

export function calcKPIs(adsMonthData, wixMonthData, monthKey) {
  const spend           = adsMonthData?.spend ?? 0;
  const conversions     = adsMonthData?.conversions ?? 0;
  const conversionValue = adsMonthData?.conversionValue ?? 0;
  const revenue         = wixMonthData?.revenue ?? 0;
  const orderCount      = wixMonthData?.orderCount ?? 0;
  const aov             = orderCount > 0 ? revenue / orderCount : 0;

  // Suppress ROAS for past months where Ads only ran a partial slice (< 15 days),
  // e.g. December 2025 where Ads started Dec 29. The current month is always
  // shown regardless of how many days have elapsed so far.
  const isCurrent = !monthKey || monthKey >= CURRENT_MONTH_KEY;
  const isPartialMonth = !isCurrent && adsMonthData && (adsMonthData.daysActive ?? 31) < 15;
  const roas = (!isPartialMonth && spend > 0) ? conversionValue / spend : null;

  return { spend, revenue, roas, conversions, orderCount, aov, conversionValue };
}

export function calcCampaignRows(adsCampaignMap) {
  if (!adsCampaignMap) return [];
  const rows = [];
  for (const [name, data] of adsCampaignMap.entries()) {
    const campRoas = data.spend > 0 ? data.conversionValue / data.spend : null;
    rows.push({
      name,
      spend: data.spend,
      conversionValue: data.conversionValue,
      conversions: data.conversions,
      aov: data.conversions > 0 ? data.conversionValue / data.conversions : 0,
      roas: campRoas,
      impressions: data.impressions,
      clicks: data.clicks,
    });
  }
  return rows.sort((a, b) => b.spend - a.spend);
}

// Trend uses Google Ads ROAS (conv value / spend) — not total Wix revenue.
export function calcTrend(adsMap, wixMap, currentMonth, currentYear) {
  const points = [];
  let m = currentMonth;
  let y = currentYear;

  for (let i = 0; i < 12; i++) {
    const key = getMonthKey(m, y);
    const ads = adsMap.get(key);
    const wix = wixMap.get(key);
    if (ads || wix) {
      const spend           = ads?.spend ?? 0;
      const conversionValue = ads?.conversionValue ?? 0;
      const isCurrent       = key >= CURRENT_MONTH_KEY;
      const isPartial       = !isCurrent && ads && (ads.daysActive ?? 31) < 15;

      if (!isPartial) {
        const roas = spend > 0 ? conversionValue / spend : null;
        points.unshift({
          label: shortMonthLabel(m),
          key,
          roas,
          spend,
          conversionValue,
          totalRevenue: wix?.revenue ?? 0,
          campaigns: ads?.campaigns ?? new Map(),
        });
      }
    }
    if (m === 0) { m = 11; y -= 1; } else { m -= 1; }
  }
  return points;
}

export function delta(current, previous) {
  if (!previous || previous === 0) return null;
  return (current - previous) / previous;
}

export function roasBadgeClass(roas) {
  if (roas === null || roas === undefined) return 'none';
  if (roas >= 2) return 'good';
  if (roas >= 1) return 'ok';
  return 'poor';
}
