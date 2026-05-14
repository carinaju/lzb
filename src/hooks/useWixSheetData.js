// Reads Wix monthly revenue data from a Google Sheet.
// The sheet should have columns: Month (YYYY-MM) | Revenue | Orders | AOV
// Set VITE_WIX_SHEET_ID in .env.local to enable.

import { useState, useEffect, useCallback } from 'react';

const WIX_SHEET_ID = import.meta.env.VITE_WIX_SHEET_ID ?? '';

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
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

export function useWixSheetData() {
  const [wixRows, setWixRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion(v => v + 1), []);

  useEffect(() => {
    if (!WIX_SHEET_ID) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);

    const url = `https://docs.google.com/spreadsheets/d/${WIX_SHEET_ID}/gviz/tq?tqx=out:csv`;
    fetch(url)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.text(); })
      .then(text => {
        if (cancelled) return;
        const rows = parseCsv(text).slice(1); // skip header
        setWixRows(rows);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [version]);

  return { wixRows, loading, refetch };
}
