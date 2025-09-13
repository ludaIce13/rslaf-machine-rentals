import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProduct, getAvailableItems, createOrder } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookingRef = useRef(null);

  // Mirror the demo mapping used in Products.js for images and categories
  const demoMap = {
    'EXC-CAT320-001': { category: 'Excavator', image: 'https://images.unsplash.com/photo-1616401784845-c97df2ce2e94?q=80&w=1200&auto=format&fit=crop' },
    'DMP-MACK-GRN-001': { category: 'Dump Truck', image: 'https://images.unsplash.com/photo-1635322160730-70a87dcc2069?q=80&w=1200&auto=format&fit=crop' },
    'BHL-JD-410L-001': { category: 'Backhoe Loader', image: 'https://images.unsplash.com/photo-1570126646281-5ec88111777d?q=80&w=1200&auto=format&fit=crop' },
    'WHL-CAT950M-001': { category: 'Wheel Loader', image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=1200&auto=format&fit=crop' },
    'CRN-GRV-RT890E-001': { category: 'Crane', image: 'https://images.unsplash.com/photo-1541976076758-347942db197a?q=80&w=1200&auto=format&fit=crop' },
    'BLD-CAT-D6T-001': { category: 'Bulldozer', image: 'https://images.unsplash.com/photo-1574201635302-388dd92a4c22?q=80&w=1200&auto=format&fit=crop' },
  };

  const getCategory = (p) => p?.category || p?.type || demoMap[p?.sku]?.category || 'Equipment';
  const getImage = (p) => p?.image_url || p?.image || p?.thumbnail_url || demoMap[p?.sku]?.image || '';

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  // Datetime strings in input[type="datetime-local"] format (local time without Z)
  const [startDt, setStartDt] = useState('');
  const [endDt, setEndDt] = useState('');
  const [hours, setHours] = useState(''); // string to bind to input, we'll parse to number
  const [checking, setChecking] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProduct(id);
        setProduct(res.data);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // On first load, scroll to booking section so the user can proceed
  useEffect(() => {
    const t = setTimeout(() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    return () => clearTimeout(t);
  }, []);

  // Prefill datetimes from query params and auto-check when both are present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('start') || '';
    const e = params.get('end') || '';
    let changed = false;
    if (s && s !== startDt) { setStartDt(s); changed = true; }
    if (e && e !== endDt) { setEndDt(e); changed = true; }
    if (changed && s && e) {
      // defer to ensure state updated before check
      setTimeout(() => { onCheck(); }, 0);
      // Auto-scroll to booking section so user can proceed immediately
      setTimeout(() => { bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived hours and days
  const derived = useMemo(() => {
    if (!startDt || !endDt) return { hours: 0, days: 0 };
    const s = new Date(startDt);
    const e = new Date(endDt);
    const ms = e - s;
    if (ms <= 0) return { hours: 0, days: 0 };
    const hrs = Math.ceil(ms / (1000 * 60 * 60));
    const dys = ms / (1000 * 60 * 60 * 24);
    return { hours: hrs, days: dys };
  }, [startDt, endDt]);

  const estimate = useMemo(() => {
    if (!product) return 0;
    // Prefer hourly pricing when available
    if ((product.hourly_rate || 0) > 0) {
      if (!derived.hours) return 0;
      return Math.round((product.hourly_rate * derived.hours) * 100) / 100;
    }
    if (!derived.days) return 0;
    return Math.round((product.daily_rate || 0) * derived.days * 100) / 100;
  }, [product, derived]);

  // Two-way sync: when start or hours changes, recompute end; when end changes, recompute hours.
  useEffect(() => {
    if (!startDt || hours === '') return;
    const h = Math.max(0, parseInt(hours, 10) || 0);
    if (h === 0) return;
    const s = new Date(startDt);
    const newEnd = new Date(s.getTime() + h * 3600 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const localISO = `${newEnd.getFullYear()}-${pad(newEnd.getMonth()+1)}-${pad(newEnd.getDate())}T${pad(newEnd.getHours())}:${pad(newEnd.getMinutes())}`;
    setEndDt((prev) => prev !== localISO ? localISO : prev);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDt, hours]);

  useEffect(() => {
    if (!startDt || !endDt) return;
    const s = new Date(startDt);
    const e = new Date(endDt);
    const ms = e - s;
    const hrs = ms > 0 ? Math.ceil(ms / 3600000) : 0;
    const next = hrs ? String(hrs) : '';
    setHours((prev) => prev !== next ? next : prev);
  }, [startDt, endDt]);

  const onCheck = async () => {
    if (!startDt || !endDt) {
      toast.info('Please select a start and end date');
      return;
    }
    if (derived.hours <= 0) {
      toast.warn('End date must be after start date');
      return;
    }
    // Enforce product hours constraints if provided
    const minH = product?.min_hours || 0;
    const maxH = product?.max_hours || null;
    if (minH && derived.hours < minH) {
      toast.warn(`Minimum rental is ${minH} hour${minH===1?'':'s'}`);
      return;
    }
    if (maxH && derived.hours > maxH) {
      toast.warn(`Maximum rental is ${maxH} hours`);
      return;
    }
    try {
      setChecking(true);
      const res = await getAvailableItems(id, new Date(startDt).toISOString(), new Date(endDt).toISOString());
      const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      setAvailableItems(items);
      if (items.length === 0) {
        toast.warn('No units available for the selected period');
      } else {
        setSelectedItemId(items[0]?.id || '');
        toast.success('Availability confirmed');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to check availability');
    } finally {
      setChecking(false);
    }
  };

  const onBook = async () => {
    if (!selectedItemId) {
      toast.info('Please select an available unit');
      return;
    }
    const minH = product?.min_hours || 0;
    const maxH = product?.max_hours || null;
    if (minH && derived.hours < minH) {
      toast.warn(`Minimum rental is ${minH} hour${minH===1?'':'s'}`);
      return;
    }
    if (maxH && derived.hours > maxH) {
      toast.warn(`Maximum rental is ${maxH} hours`);
      return;
    }
    try {
      setBooking(true);
      const payload = {
        reservations: [
          { inventory_item_id: selectedItemId, start_date: new Date(startDt).toISOString(), end_date: new Date(endDt).toISOString() }
        ]
      };
      const res = await createOrder(payload);
      toast.success('Booking created');
      navigate('/orders');
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.detail || 'Failed to create booking';
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p>Product not found.</p>
        <Link to="/products" className="btn btn-primary">← Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ position: 'relative', height: 320, borderRadius: 12, overflow: 'hidden', background: '#f0f2f5' }}>
            {getImage(product) ? (
              <img src={getImage(product)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ height: '100%', background: 'linear-gradient(135deg,#667eea,#764ba2)' }} />
            )}
            <span style={{ position: 'absolute', top: 12, right: 12, background: '#ff7f32', color: '#fff', padding: '6px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{getCategory(product)}</span>
          </div>
          <h1 style={{ marginTop: '1rem', color: '#2c3e50' }}>{product.name}</h1>
          <p style={{ color: '#6c757d' }}>{product.description}</p>
          <div style={{ marginTop: '0.5rem', color: '#2c3e50', fontWeight: 600 }}>
            {(product.hourly_rate || 0) > 0 ? (
              <>${product.hourly_rate}/hour</>
            ) : (
              <>${product.daily_rate}/day</>
            )}
          </div>
        </div>

        <div ref={bookingRef} style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: '1.25rem' }}>
          <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Book this equipment</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, color: '#2c3e50', marginBottom: 4 }}>Start</label>
              <input type="datetime-local" value={startDt} onChange={(e)=>setStartDt(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #e1e5ea' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, color: '#2c3e50', marginBottom: 4 }}>End</label>
              <input type="datetime-local" value={endDt} onChange={(e)=>setEndDt(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #e1e5ea' }} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: 14, color: '#2c3e50', marginBottom: 4 }}>Hours</label>
            <input type="number" min="1" step="1" placeholder="e.g. 100" value={hours} onChange={(e)=>setHours(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #e1e5ea' }} />
            {(startDt && hours) && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#6c757d' }}>
                Return by: <strong>{endDt || '—'}</strong>
              </div>
            )}
            {(product?.min_hours || product?.max_hours) && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#6c757d' }}>
                {product?.min_hours ? `Minimum: ${product.min_hours}h` : ''}
                {product?.min_hours && product?.max_hours ? ' • ' : ''}
                {product?.max_hours ? `Maximum: ${product.max_hours}h` : ''}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button onClick={onCheck} disabled={checking || !startDt || !endDt} className="btn btn-primary" style={{ background: '#1b7a23' }}>
              {checking ? 'Checking…' : 'Check Availability'}
            </button>
            <Link to="/products" className="btn btn-outline">Back to Catalog</Link>
          </div>

          {availableItems.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: 14, color: '#2c3e50', marginBottom: 4 }}>Select unit</label>
              <select value={selectedItemId} onChange={(e)=>setSelectedItemId(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #e1e5ea' }}>
                {availableItems.map((it) => (
                  <option key={it.id} value={it.id}>#{it.id} {it.serial ? `• ${it.serial}` : ''}</option>
                ))}
              </select>

              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 8, border: '1px solid #e9ecef' }}>
                {(product.hourly_rate || 0) > 0 ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Hours</span>
                      <strong>{derived.hours}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      <span>Rate</span>
                      <strong>${product.hourly_rate}/hour</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Days</span>
                      <strong>{Math.max(1, Math.ceil(derived.days))}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      <span>Rate</span>
                      <strong>${product.daily_rate}/day</strong>
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span>Estimated total</span>
                  <strong>${estimate}</strong>
                </div>
              </div>

              <button onClick={onBook} disabled={booking} className="btn btn-primary" style={{ marginTop: '0.75rem', background: '#1b7a23' }}>
                {booking ? 'Booking…' : 'Book Now'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;