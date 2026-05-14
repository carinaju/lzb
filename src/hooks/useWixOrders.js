import { useState, useEffect, useCallback } from 'react';

export function useWixOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion(v => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch('/api/wix-orders')
      .then(res => {
        if (!res.ok) throw new Error(`Wix orders fetch failed (HTTP ${res.status})`);
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        setOrders(Array.isArray(data) ? data : (data.orders ?? []));
        setLoading(false);
      })
      .catch(() => {
        // Wix proxy not yet configured — render the dashboard with Ads data only.
        if (cancelled) return;
        setOrders([]);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [version]);

  return { orders, loading, error, refetch };
}
