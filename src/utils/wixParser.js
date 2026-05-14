import { isoToMonthKey } from './dateUtils';

// Parses Wix order objects returned by the /api/wix-orders proxy.
// The proxy returns either:
//   a) Real individual order objects (small stores / recent orders)
//   b) Synthetic monthly summary objects with _monthSummary:true (high-volume stores)
//      { createdDate, priceSummary.total.amount (= total revenue), _orderCount }

export function parseWixOrders(orders) {
  // Returns: Map<'YYYY-MM', { revenue, orderCount, aov }>
  const monthMap = new Map();

  for (const order of orders) {
    const dateStr = order.createdDate || '';
    const key = isoToMonthKey(dateStr.substring(0, 10));
    if (!key) continue;

    const amount = parseFloat(order?.priceSummary?.total?.amount ?? 0);
    if (isNaN(amount)) continue;

    const count = order._orderCount ?? 1;

    if (!monthMap.has(key)) {
      monthMap.set(key, { revenue: 0, orderCount: 0, aov: 0 });
    }
    const m = monthMap.get(key);
    m.revenue += amount;
    m.orderCount += count;
  }

  for (const m of monthMap.values()) {
    m.aov = m.orderCount > 0 ? m.revenue / m.orderCount : 0;
  }

  return monthMap;
}
