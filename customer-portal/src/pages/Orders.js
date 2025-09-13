import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/api';

const statusColor = (s) => {
  switch (s) {
    case 'confirmed': return { bg: '#e6f7ed', color: '#1b7a23', border: '#c8ecd3' };
    case 'pending': return { bg: '#fff8e6', color: '#8a6d1e', border: '#fde4b2' };
    case 'cancelled': return { bg: '#fdecea', color: '#a61d24', border: '#f5c6cb' };
    case 'returned': return { bg: '#e8f4fd', color: '#1b4f72', border: '#cfe8fb' };
    default: return { bg: '#eef2f7', color: '#334155', border: '#e2e8f0' };
  }
};

const fmt = (d) => new Date(d).toLocaleDateString();

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyOrders();
        setOrders(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p>Loading your bookings…</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '1rem', color: '#2c3e50' }}>My Bookings</h1>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
          <p>You don't have any bookings yet.</p>
          <Link to="/products" className="btn btn-primary">Browse Equipment</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', maxWidth: 1000 }}>
          {orders.map((o) => {
            const c = statusColor(o.status);
            // compute overall date range from reservations
            const starts = o.reservations?.map(r => new Date(r.start_date)) || [];
            const ends = o.reservations?.map(r => new Date(r.end_date)) || [];
            const startMin = starts.length ? new Date(Math.min(...starts)) : null;
            const endMax = ends.length ? new Date(Math.max(...ends)) : null;
            return (
              <div key={o.id} style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#2c3e50' }}>Order #{o.id}</div>
                    <div style={{ color: '#6c757d', fontSize: 14 }}>
                      {startMin && endMax ? (
                        <>
                          {startMin.toLocaleDateString()} – {endMax.toLocaleDateString()}
                        </>
                      ) : 'No dates'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '0.25rem 0.5rem', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{o.status}</span>
                    <div style={{ fontWeight: 700, color: '#2c3e50' }}>${o.total?.toFixed ? o.total.toFixed(2) : o.total}</div>
                    <Link to={`/orders/${o.id}`} className="btn btn-outline">View</Link>
                  </div>
                </div>
                {o.reservations && o.reservations.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                    {o.reservations.map((r) => (
                      <div key={r.id} style={{ border: '1px solid #eef2f7', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                        <div style={{ fontSize: 12, color: '#6c757d' }}>Unit #{r.inventory_item_id}</div>
                        <div style={{ fontWeight: 600, color: '#2c3e50' }}>{fmt(r.start_date)} – {fmt(r.end_date)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;