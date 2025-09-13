import React, { useEffect, useMemo, useState } from 'react';
import { getCustomers } from '../services/api';

const Customers = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCustomers();
        setCustomers(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return customers.filter(c =>
      (c.name || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s) ||
      (c.phone || '').toLowerCase().includes(s)
    );
  }, [customers, search]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p>Loading customers…</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ color: '#2c3e50' }}>Customers</h1>

      <div style={{ maxWidth: 480, marginBottom: '1rem' }}>
        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search by name, email, or phone"
          style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #e1e5ea' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>No customers found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {filtered.map((c) => (
            <div key={c.id} style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 44, height: 44, background: '#1b7a23', color: '#fff', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {(c.name || c.email || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#2c3e50' }}>{c.name || 'Unnamed Customer'}</div>
                  <div style={{ fontSize: 12, color: '#6c757d' }}>{c.email || '—'}</div>
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: 14, color: '#2c3e50' }}>
                <strong>Phone:</strong> {c.phone || '—'}
              </div>
              {c.company && (
                <div style={{ fontSize: 14, color: '#2c3e50' }}>
                  <strong>Company:</strong> {c.company}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Customers;
