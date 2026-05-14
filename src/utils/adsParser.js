import { parseDateString, getMonthKey } from './dateUtils';

// Supermetrics sheet columns (0-indexed) — current layout:
// 0:  Date
// 1:  Impressions
// 2:  Clicks
// 3:  CTR
// 4:  CPC
// 5:  Cost (Ad Spend)
// 6:  Cost per conversion
// 7:  Conversion rate
// 8:  Total conversion value
// 9:  All conversions value per cost
// 10: ROAS (pre-calculated by Google Ads)
//
// MISSING for per-campaign breakdown:
//   Add "Campaign" as a dimension in your Supermetrics query.
//   Place it at column index 1 and shift the rest right.
//   Set HAS_CAMPAIGN_COLUMN = true once that's done.

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
    const costPerConv     = parseNum(row[6 + colOffset]);
    // col 7: conversion rate — skip
    const conversionValue = parseNum(row[8 + colOffset]);
    // Derive conversion count from Cost ÷ Cost-per-conversion
    const conversions     = costPerConv > 0 ? spend / costPerConv : 0;

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
