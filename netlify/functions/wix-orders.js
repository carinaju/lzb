// Netlify serverless function — fetches Wix monthly revenue summaries.
// Set in Netlify dashboard → Environment variables:
//   WIX_API_KEY   — your Wix API key (IST.xxx)
//   WIX_SITE_ID   — your Wix site ID

async function wixPost(apiKey, siteId, body) {
  const res = await fetch('https://www.wixapis.com/ecom/v1/orders/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
      'wix-site-id': siteId,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Wix API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function fetchMonthSummary(apiKey, siteId, year, month, maxPages = 15) {
  const from = new Date(year, month, 1).toISOString();
  const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  let revenue = 0;
  let orderCount = 0;
  let cursor = null;

  for (let page = 0; page < maxPages; page++) {
    const data = await wixPost(apiKey, siteId, {
      search: {
        filter: {
          $and: [
            { paymentStatus: { $eq: 'PAID' } },
            { createdDate: { $gte: from } },
            { createdDate: { $lte: to } },
          ],
        },
        cursorPaging: { limit: 100, ...(cursor ? { cursor } : {}) },
      },
    });

    const orders = data.orders ?? [];
    for (const o of orders) {
      revenue += parseFloat(o.priceSummary?.total?.amount ?? 0);
      orderCount++;
    }

    const next = data.metadata?.cursors?.next;
    if (!next || orders.length < 100) break;
    cursor = next;
  }

  const key = `${year}-${String(month + 1).padStart(2, '0')}`;
  return { key, revenue, orderCount };
}

function last13Months() {
  const now = new Date();
  const months = [];
  for (let i = 0; i < 13; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return months;
}

export const handler = async () => {
  const apiKey = process.env.WIX_API_KEY;
  const siteId = process.env.WIX_SITE_ID;

  if (!apiKey || !siteId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'WIX_API_KEY and WIX_SITE_ID must be set.' }),
    };
  }

  try {
    const months = last13Months();
    const results = await Promise.all(
      months.map(({ year, month }) => fetchMonthSummary(apiKey, siteId, year, month))
    );

    // Return synthetic monthly summary objects
    const synthetic = results
      .filter(r => r.orderCount > 0)
      .map(r => ({
        createdDate: `${r.key}-01T12:00:00.000Z`,
        priceSummary: { total: { amount: String(r.revenue.toFixed(2)) } },
        _monthSummary: true,
        _orderCount: r.orderCount,
        _key: r.key,
      }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(synthetic),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
