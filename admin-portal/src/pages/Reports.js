import React from 'react';

const Reports = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Generate insights and analyze business performance</p>
      </div>
      
      <div className="page-content">
        <div style={{ padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ color: '#6c757d', marginBottom: '20px' }}>Coming Soon:</h3>
          <ul style={{ listStyle: 'none', padding: 0, color: '#6c757d' }}>
            <li style={{ marginBottom: '10px' }}>💰 Revenue reports</li>
            <li style={{ marginBottom: '10px' }}>📊 Order analytics</li>
            <li style={{ marginBottom: '10px' }}>👥 Customer analytics</li>
            <li style={{ marginBottom: '10px' }}>📈 Product performance reports</li>
            <li style={{ marginBottom: '10px' }}>📦 Inventory reports</li>
            <li style={{ marginBottom: '10px' }}>🛠️ Custom report builder</li>
            <li style={{ marginBottom: '10px' }}>📤 Data export functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;