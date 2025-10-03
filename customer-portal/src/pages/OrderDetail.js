import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../services/api';

const fmt = (d) => new Date(d).toLocaleString();

const OrderDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [publicInfo, setPublicInfo] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOrder(id);
        setOrder(res.data);
        // Also fetch public metadata to get lateness and expected return info
        try {
          const pubRes = await fetch('https://rslaf-backend.onrender.com/orders/public/all');
          if (pubRes.ok) {
            const pub = await pubRes.json();
            const match = Array.isArray(pub) ? pub.find((o) => o.id === Number(id)) : null;
            if (match) setPublicInfo(match);
          }
        } catch (e) {
          // non-blocking
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p>Loading order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p>Order not found.</p>
        <Link to="/orders" className="btn btn-primary">← Back to My Bookings</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ color: '#2c3e50' }}>Order #{order.id}</h1>
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ padding: '0.25rem 0.5rem', borderRadius: 999, background: '#eef2f7', color: '#334155', fontWeight: 700, textTransform: 'capitalize' }}>{order.status}</span>
      </div>
      {publicInfo?.is_late_return && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FDE68A', color: '#92400E', padding: '0.75rem 1rem', borderRadius: 12, marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>⏰ Rental time expired</div>
          <div style={{ fontSize: 14 }}>
            Your rental period has ended. Extra billing is active until the equipment is returned.
            {typeof publicInfo.extra_billing_hours === 'number' && (
              <> Current extra time: <strong>{publicInfo.extra_billing_hours.toFixed(2)}h</strong></>
            )}
            {typeof publicInfo.extra_billing_amount === 'number' && (
              <> · Estimated extra: <strong>SLL {Number(publicInfo.extra_billing_amount).toLocaleString()}</strong></>
            )}
          </div>
          {publicInfo.expected_return_time && (
            <div style={{ fontSize: 12, marginTop: 6, color: '#7C2D12' }}>
              Expected Return Time: {new Date(publicInfo.expected_return_time).toLocaleString()}
            </div>
          )}
        </div>
      )}
      <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: '1rem' }}>
        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Reservations</h3>
        {!order.reservations || order.reservations.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No reservations found on this order.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {order.reservations.map((r) => (
              <div key={r.id} style={{ border: '1px solid #eef2f7', borderRadius: 8, padding: '0.75rem' }}>
                <div style={{ fontSize: 12, color: '#6c757d' }}>Unit #{r.inventory_item_id}</div>
                <div style={{ fontWeight: 600, color: '#2c3e50' }}>{fmt(r.start_date)} – {fmt(r.end_date)}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '1rem' }}>
          <div><strong>Subtotal:</strong> ${order.subtotal?.toFixed ? order.subtotal.toFixed(2) : order.subtotal}</div>
          <div><strong>Total:</strong> ${order.total?.toFixed ? order.total.toFixed(2) : order.total}</div>
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <Link to="/orders" className="btn btn-outline">← Back to My Bookings</Link>
      </div>
    </div>
  );
};

export default OrderDetail;
