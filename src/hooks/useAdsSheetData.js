import { useState, useEffect, useCallback } from 'react';

const ADS_SHEET_ID = import.meta.env.VITE_ADS_SHEET_ID ?? '';

function csvUrl(sheetId, gid) {
  const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  return gid ? `${base}&gid=${gid}` : base;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\r' && next === '\n') { row.push(field); field = ''; rows.push(row); row = []; i++; }
      else if (ch === '\n' || ch === '\r') { row.push(field); field = ''; rows.push(row); row = []; }
      else { field += ch; }
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

async function fetchCsv(sheetId, skipRows = 1, gid) {
  const res = await fetch(csvUrl(sheetId, gid));
  if (!res.ok) throw new Error(`Google Sheets fetch failed (HTTP ${res.status})`);
  const text = await res.text();
  const rows = parseCsv(text);
  return rows.slice(skipRows);
}

export function useAdsSheetData() {
  const [adsRows, setAdsRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion(v => v + 1), []);

  useEffect(() => {
    if (!ADS_SHEET_ID) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCsv(ADS_SHEET_ID, 1)
      .then(rows => {
        if (cancelled) return;
        setAdsRows(rows);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message || 'Failed to load Google Ads sheet');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [version]);

  return { adsRows, loading, error, refetch };
}
