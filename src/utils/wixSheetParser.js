// Parses the Wix revenue Google Sheet.
//
// Supports three formats auto-detected from column 0:
//
// Format A — Monthly aggregates (YYYY-MM):
//   Month | Revenue | Orders | AOV (optional)
//   Used for historical data imports.
//
// Format B — Daily summaries (YYYY-MM-DD):
//   Date | Revenue | Orders | Source (optional: GOOGLE_ADS etc.)
//   Used for ongoing daily automation via Google Apps Script.
//
// Formats can be mixed in the same sheet. All rows are grouped by month.

function parseNum(str) {
  if (!str) return 0;
  // Handle German number format (1.234,56 → 1234.56)
  const s = String(str).replace(/[€\s]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.');
  return parseFloat(s.replace(/[^\d.-]/g, '')) || 0;
}

export function parseWixSheet(rows) {
  // Returns: Map<'YYYY-MM', { revenue, orderCount, aov, adsRevenue, adsOrderCount }>
  const monthMap = new Map();

  for (const row of rows) {
    if (!row || row.length < 2) continue;
    const col0 = (row[0] || '').trim();

    if (/^\d{4}-\d{2}$/.test(col0)) {
      // Format A: monthly aggregate
      const key = col0;
      const revenue    = parseNum(row[1]);
      const orderCount = parseNum(row[2]);
      const aov = row[3] ? parseNum(row[3]) : (orderCount > 0 ? revenue / orderCount : 0);
      monthMap.set(key, { revenue, orderCount, aov, adsRevenue: 0, adsOrderCount: 0 });

    } else if (/^\d{4}-\d{2}-\d{2}/.test(col0)) {
      // Format B: daily summary row
      const key        = col0.substring(0, 7);  // YYYY-MM
      const revenue    = parseNum(row[1]);
      const orderCount = row[2] ? parseNum(row[2]) : 1; // col 2 = order count; default 1 for individual-order rows
      const source     = (row[3] || '').trim().toUpperCase();
      const isAds      = source === 'GOOGLE_ADS';

      if (!monthMap.has(key)) {
        monthMap.set(key, { revenue: 0, orderCount: 0, aov: 0, adsRevenue: 0, adsOrderCount: 0 });
      }
      const m = monthMap.get(key);
      m.revenue     += revenue;
      m.orderCount  += orderCount;
      if (isAds) { m.adsRevenue += revenue; m.adsOrderCount += orderCount; }
    }
  }

  // Compute AOV for Format B entries (where it wasn't set directly)
  for (const m of monthMap.values()) {
    if (m.aov === 0 && m.orderCount > 0) m.aov = m.revenue / m.orderCount;
  }

  return monthMap;
}
