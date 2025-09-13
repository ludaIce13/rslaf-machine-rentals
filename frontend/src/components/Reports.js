import React, { useState, useEffect } from 'react';
import { getUpcomingReservations, getUtilization } from '../services/api';
import { format } from 'date-fns';

const Reports = () => {
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [utilization, setUtilization] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const start = `${dateRange.start}T00:00:00`;
      const end = `${dateRange.end}T23:59:59`;
      
      const [reservationsResponse, utilizationResponse] = await Promise.all([
        getUpcomingReservations(start, end),
        getUtilization(start, end)
      ]);
      
      setUpcomingReservations(reservationsResponse.data);
      setUtilization(utilizationResponse.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange({ ...dateRange, [field]: value });
  };

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>Reports</h1>
      
      {/* Date Range Selector */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginTop: 0, color: '#34495e' }}>Date Range</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Date:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Date:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
        <button
          onClick={loadReports}
          disabled={loading}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Update Reports'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
        {/* Utilization Report */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#34495e' }}>Utilization</h3>
          
          {utilization ? (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                    {utilization.utilization_percent}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#6c757d' }}>Utilization Rate</div>
                </div>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                    {utilization.reserved_item_days}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6c757d' }}>Reserved Item-Days</div>
                </div>
              </div>
              
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                <p><strong>Capacity:</strong> {utilization.capacity_item_days} item-days</p>
                <p><strong>Period:</strong> {format(new Date(utilization.start), 'MMM dd, yyyy')} - {format(new Date(utilization.end), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          ) : (
            <div style={{ color: '#6c757d' }}>Loading utilization data...</div>
          )}
        </div>

        {/* Reservations Summary */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#34495e' }}>Reservations Summary</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '15px',
              backgroundColor: '#e8f5e8',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                {upcomingReservations.length}
              </div>
              <div style={{ fontSize: '14px', color: '#155724' }}>Total Reservations</div>
            </div>
            <div style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                {new Set(upcomingReservations.map(r => r.inventory_item_id)).size}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>Unique Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '30px'
      }}>
        <h3 style={{ marginTop: 0, color: '#34495e' }}>Reservations Detail</h3>
        
        {upcomingReservations.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
            No reservations found for the selected period.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Reservation ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Order ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Item ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Start Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>End Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {upcomingReservations.map(reservation => {
                  const start = new Date(reservation.start_date);
                  const end = new Date(reservation.end_date);
                  const durationDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                  
                  return (
                    <tr key={reservation.reservation_id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>#{reservation.reservation_id}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>#{reservation.order_id}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{reservation.inventory_item_id}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                        {format(start, 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                        {format(end, 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                        {durationDays} day{durationDays !== 1 ? 's' : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
