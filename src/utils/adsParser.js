import { parseDateString, getMonthKey } from './dateUtils';

// Google Ads sheet columns (0-indexed) — current layout (campaign column included):
// 0:  Date
// 1:  Campaign
// 2:  Impressions
// 3:  Clicks
// 4:  CTR
// 5:  Avg. CPC
// 6:  Cost (Ad Spend)
// 7:  Cost / conv.
// 8:  Conv. rate
// 9:  Conversions (direct count)
// 10: All conv.
// 11: Conversions value

export const HAS_CAMPAIGN_COLUMN = true;

function parseNum(str) {
  if (str === null || str === undefined || str === '') return 0;
  return parseFloat(String(str).replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
}

export function parseAdsSheet(rows) {
  // Returns: Map<'YYYY-MM', { spend, conversions, conversionValue, impressions, clicks, campaigns: Map<name, {...}> }>
  const monthMap = new Map();

  for (const row of rows) {
    if (!row || row.length < 6) continue;
    const dateStr = row[0];
    if (!dateStr) continue;

    const parsed = parseDateString(dateStr);
    if (!parsed) continue;
    const key = getMonthKey(parsed.month, parsed.year);

    let campaign = 'All Campaigns';
    let colOffset = 0;

    if (HAS_CAMPAIGN_COLUMN) {
      const rawCampaign = (row[1] || '').trim();
      const looksNumeric = rawCampaign !== '' && !isNaN(parseFloat(rawCampaign));
      if (!looksNumeric && rawCampaign) {
        campaign = rawCampaign;
        colOffset = 1;
      }
      // else: aggregate/total row without campaign name — keep colOffset=0, group as 'All Campaigns'
    }

    const impressions     = parseNum(row[1 + colOffset]);
    const clicks          = parseNum(row[2 + colOffset]);
    // col 3: CTR, col 4: CPC — skip
    const spend           = parseNum(row[5 + colOffset]);
    // col 6: Cost/conv., col 7: Conv. rate — skip
    const conversions     = parseNum(row[8 + colOffset]);  // col 9 = direct count
    const conversionValue = parseNum(row[10 + colOffset]); // col 11 = Conversions value

    if (!monthMap.has(key)) {
      monthMap.set(key, { spend: 0, conversions: 0, conversionValue: 0, impressions: 0, clicks: 0, daysActive: 0, campaigns: new Map() });
    }
    const month = monthMap.get(key);
    month.daysActive      += 1;
    month.spend           += spend;
    month.conversions     += conversions;
    month.conversionValue += conversionValue;
    month.impressions     += impressions;
    month.clicks          += clicks;

    if (!month.campaigns.has(campaign)) {
      month.campaigns.set(campaign, { spend: 0, conversions: 0, conversionValue: 0, impressions: 0, clicks: 0 });
    }
    const camp = month.campaigns.get(campaign);
    camp.spend           += spend;
    camp.conversions     += conversions;
    camp.conversionValue += conversionValue;
    camp.impressions     += impressions;
    camp.clicks          += clicks;
  }

  return monthMap;
}

export function getAvailableMonths(monthMap) {
  return new Set(monthMap.keys());
}
