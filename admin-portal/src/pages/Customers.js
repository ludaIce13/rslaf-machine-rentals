import React from 'react';

const Customers = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Customers Management</h1>
        <p className="page-subtitle">Manage customer profiles and rental history</p>
      </div>
      
      <div className="page-content">
        <div style={{ padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ color: '#6c757d', marginBottom: '20px' }}>Coming Soon:</h3>
          <ul style={{ listStyle: 'none', padding: 0, color: '#6c757d' }}>
            <li style={{ marginBottom: '10px' }}>👥 View all customers</li>
            <li style={{ marginBottom: '10px' }}>📋 Customer details and contact information</li>
            <li style={{ marginBottom: '10px' }}>📊 Customer order history</li>
            <li style={{ marginBottom: '10px' }}>🎯 Customer preferences and notes</li>
            <li style={{ marginBottom: '10px' }}>💬 Customer communication tools</li>
            <li style={{ marginBottom: '10px' }}>📈 Customer analytics and reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Customers;