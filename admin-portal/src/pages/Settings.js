import React from 'react';

const Settings = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure system settings and business preferences</p>
      </div>
      
      <div className="page-content">
        <div style={{ padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ color: '#6c757d', marginBottom: '20px' }}>Coming Soon:</h3>
          <ul style={{ listStyle: 'none', padding: 0, color: '#6c757d' }}>
            <li style={{ marginBottom: '10px' }}>⚙️ General settings</li>
            <li style={{ marginBottom: '10px' }}>🏢 Business information</li>
            <li style={{ marginBottom: '10px' }}>💳 Payment configuration</li>
            <li style={{ marginBottom: '10px' }}>📧 Email settings</li>
            <li style={{ marginBottom: '10px' }}>🔔 Notification preferences</li>
            <li style={{ marginBottom: '10px' }}>👤 User management</li>
            <li style={{ marginBottom: '10px' }}>🖥️ System configuration</li>
            <li style={{ marginBottom: '10px' }}>🔌 API settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;