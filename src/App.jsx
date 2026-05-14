import { useState, useMemo } from 'react';
import './index.css';

import Header from './components/Header';
import Footer from './components/Footer';
import MonthSelector from './components/MonthSelector';
import KPICards from './components/KPICards';
import ROASRing from './components/ROASRing';
import ROASTrendChart from './components/ROASTrendChart';
import CampaignTable from './components/CampaignTable';

import { useAdsSheetData } from './hooks/useAdsSheetData';
import { useWixSheetData } from './hooks/useWixSheetData';

import { parseAdsSheet, getAvailableMonths } from './utils/adsParser';
import { parseWixSheet } from './utils/wixSheetParser';
import { calcKPIs, calcCampaignRows, calcTrend } from './utils/roasCalculator';
import { getMonthKey } from './utils/dateUtils';

const now = new Date();

function aggregatePeriod(adsMap, wixMap, monthKeys) {
  const agg = { spend: 0, conversions: 0, conversionValue: 0, orderCount: 0, revenue: 0 };
  const campAgg = new Map();

  for (const key of monthKeys) {
    const a = adsMap.get(key);
    const w = wixMap.get(key);
    if (a) {
      agg.spend += a.spend;
      agg.conversions += a.conversions;
      agg.conversionValue += a.conversionValue;
      for (const [name, c] of a.campaigns.entries()) {
        if (!campAgg.has(name)) campAgg.set(name, { spend: 0, conversions: 0, conversionValue: 0, impressions: 0, clicks: 0 });
        const ca = campAgg.get(name);
        ca.spend += c.spend; ca.conversions += c.conversions; ca.conversionValue += c.conversionValue;
        ca.impressions += c.impressions; ca.clicks += c.clicks;
      }
    }
    if (w) { agg.revenue += w.revenue; agg.orderCount += w.orderCount; }
  }
  return { agg, campAgg };
}

export default function App() {
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState('monthly');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { adsRows, loading: adsLoading, error: adsError, refetch: refetchAds } = useAdsSheetData();
  const { wixRows, loading: wixLoading, refetch: refetchWix } = useWixSheetData();

  const loading = adsLoading || wixLoading;

  const adsMap = useMemo(() => parseAdsSheet(adsRows), [adsRows]);
  const wixMap = useMemo(() => parseWixSheet(wixRows), [wixRows]);

  const wixConnected = wixMap.size > 0;

  const availableMonths = useMemo(() => {
    return new Set([...getAvailableMonths(adsMap), ...wixMap.keys()]);
  }, [adsMap, wixMap]);

  const { kpis, prevKpis, campaignRows } = useMemo(() => {
    if (viewMode === 'monthly') {
      const key = getMonthKey(month, year);
      const pm = month === 0 ? 11 : month - 1;
      const py = month === 0 ? year - 1 : year;
      return {
        kpis: calcKPIs(adsMap.get(key), wixMap.get(key), key),
        prevKpis: calcKPIs(adsMap.get(getMonthKey(pm, py)), wixMap.get(getMonthKey(pm, py)), getMonthKey(pm, py)),
        campaignRows: calcCampaignRows(adsMap.get(key)?.campaigns),
      };
    }

    if (viewMode === 'ytd') {
      const keys = Array.from({ length: now.getMonth() + 1 }, (_, m) => getMonthKey(m, now.getFullYear()));
      const { agg, campAgg } = aggregatePeriod(adsMap, wixMap, keys);
      const roas = agg.spend > 0 ? agg.conversionValue / agg.spend : null;
      const aov = agg.orderCount > 0 ? agg.revenue / agg.orderCount : 0;
      return { kpis: { ...agg, roas, aov }, prevKpis: null, campaignRows: calcCampaignRows(campAgg) };
    }

    if (viewMode === 'custom' && dateRange.start && dateRange.end) {
      const startKey = dateRange.start.substring(0, 7);
      const endKey = dateRange.end.substring(0, 7);
      const keys = [...new Set([...adsMap.keys(), ...wixMap.keys()])].filter(k => k >= startKey && k <= endKey);
      const { agg, campAgg } = aggregatePeriod(adsMap, wixMap, keys);
      const roas = agg.spend > 0 ? agg.conversionValue / agg.spend : null;
      const aov = agg.orderCount > 0 ? agg.revenue / agg.orderCount : 0;
      return { kpis: { ...agg, roas, aov }, prevKpis: null, campaignRows: calcCampaignRows(campAgg) };
    }

    return { kpis: { spend: 0, revenue: 0, roas: null, conversions: 0, aov: 0, conversionValue: 0 }, prevKpis: null, campaignRows: [] };
  }, [adsMap, wixMap, month, year, viewMode, dateRange, wixConnected]);

  const trendData = useMemo(() => calcTrend(adsMap, wixMap, month, year), [adsMap, wixMap, month, year]);

  const periodLabel = viewMode === 'ytd'
    ? `Year to Date ${now.getFullYear()}`  // already English
    : viewMode === 'custom' && dateRange.start
    ? `${dateRange.start} – ${dateRange.end || '…'}`
    : null;

  // ROAS ring always uses Google's own number: Conv Value / Ad Spend
  const roasForRing = kpis.roas ?? null;

  if (loading) {
    return (<><Header /><div className="spinner-wrap"><div className="spinner" /></div></>);
  }

  if (adsError) {
    return (
      <>
        <Header />
        <div className="error-wrap">
          <h2>Google Ads data unavailable</h2>
          <p>{adsError}</p>
          <button className="btn-retry" onClick={() => { refetchAds(); refetchWix(); }}>
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="page-wrapper">

        {!wixConnected && (
          <div className="wix-notice">
            <span className="wix-notice-icon">⚠</span>
            Wix not yet connected — Revenue and AOV are estimated from Google Ads conversion tracking.
          </div>
        )}

        <div className="page-header">
          <div className="page-title">
            <h2>{periodLabel ? periodLabel : <><em>ROAS</em> Overview</>}</h2>
            <p>Google Ads · Wix · Automated Tracking</p>
          </div>
          <MonthSelector
            month={month}
            year={year}
            viewMode={viewMode}
            dateRange={dateRange}
            availableMonths={availableMonths}
            onMonthChange={(m, y) => { setMonth(m); setYear(y); }}
            onViewModeChange={setViewMode}
            onDateRangeChange={setDateRange}
          />
        </div>

        <KPICards kpis={kpis} prevKpis={prevKpis} wixConnected={wixConnected} />

        <div className="section-row">
          <ROASRing roas={roasForRing} label={viewMode === 'monthly' ? 'This Month' : 'Total'} />
          {trendData.length > 0 && <ROASTrendChart trendData={trendData} />}
        </div>

        <CampaignTable rows={campaignRows} />
      </main>
      <Footer />
    </>
  );
}
