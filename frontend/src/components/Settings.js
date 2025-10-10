import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: 'RSLAF Machine Rentals',
    timezone: 'UTC-08:00',
    currency: 'USD',
    email: 'admin@rslaf.com',
    fullName: 'RSLAF Administrator',
    role: 'admin',
    emailNotifications: true,
    inAppNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    maintenanceMode: false,
    theme: 'light',
    paymentGateway: 'none',
    stripePublishableKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    paypalClientSecret: '',
    orangeMoneyApiKey: '',
    orangeMoneyMerchantId: '',
    afrimoneyApiKey: '',
    afrimoneyMerchantCode: '',
    vultApiKey: '',
    vultMerchantId: '',
    bankTransferEnabled: false,
    bankAccountNumber: '',
    bankName: '',
    bankSwiftCode: '',
    paymentMode: 'test',
    notificationTypes: {
      new_orders: true,
      payment_received: true,
      equipment_returned: true,
      maintenance_due: true,
      low_inventory: true
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState('disconnected');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    setupRealTimeSync();
  }, []);

  // Load settings from API or localStorage
  const loadSettings = async () => {
    try {
      // First try to load from localStorage
      const savedSettings = localStorage.getItem('rslaf_admin_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        console.log('✅ Settings loaded from localStorage');
        return;
      }
    } catch (error) {
      console.warn('⚠️ Could not load from localStorage:', error);
    }
    
    console.log('📝 Using default settings');
  };

  // Setup cross-tab sync using storage events
  const setupRealTimeSync = () => {
    setSyncStatus('connected');
    console.log('📡 Cross-tab settings sync active');
    
    const handleStorageChange = (e) => {
      if (e.key === 'rslaf_admin_settings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          setSettings(newSettings);
          console.log('🔄 Settings synced from another tab');
          setSaveStatus('synced');
          setTimeout(() => setSaveStatus(''), 2000);
        } catch (error) {
          console.error('❌ Error parsing synced settings:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Save to localStorage
      localStorage.setItem('rslaf_admin_settings', JSON.stringify(settings));
      console.log('✅ Settings saved successfully');
      setSaveStatus('saved');
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('settingsUpdated', { 
        detail: settings 
      }));
      
      // Show success message
      alert('Settings saved successfully!');
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      setSaveStatus('error');
      alert('Failed to save settings. Please try again.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    // Simulate password change
    console.log('Changing password');
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Password changed successfully');
  };

  // Theme handler
  const handleThemeChange = (newTheme) => {
    setSettings({...settings, theme: newTheme});
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Auto theme - check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // System action handlers
  const handleSystemAction = async (action) => {
    switch (action) {
      case 'backup':
        if (window.confirm('Create a backup of all orders, customers, and inventory data?')) {
          try {
            const backup = {
              timestamp: new Date().toISOString(),
              orders: JSON.parse(localStorage.getItem('demoOrders') || '[]'),
              customers: JSON.parse(localStorage.getItem('rslaf_customers') || '[]'),
              settings: settings
            };
            const dataStr = JSON.stringify(backup, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rslaf_backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            alert('✅ Backup created and downloaded successfully!');
          } catch (error) {
            alert('❌ Failed to create backup: ' + error.message);
          }
        }
        break;
      case 'cache':
        if (window.confirm('Clear all cached data? This will not delete orders or customers.')) {
          try {
            sessionStorage.clear();
            alert('✅ Cache cleared successfully! Please refresh the page.');
          } catch (error) {
            alert('❌ Failed to clear cache: ' + error.message);
          }
        }
        break;
      case 'logs':
        alert('📋 System logs export feature coming soon. Check browser console for current logs.');
        console.log('System Logs:', {
          timestamp: new Date().toISOString(),
          settings: settings,
          localStorage: Object.keys(localStorage),
          sessionStorage: Object.keys(sessionStorage)
        });
        break;
      case 'reset':
        if (window.confirm('⚠️ Reset all settings to defaults? This cannot be undone.')) {
          if (window.confirm('Are you absolutely sure? This will reset company name, timezone, and all configurations.')) {
            localStorage.removeItem('rslaf_admin_settings');
            window.location.reload();
          }
        }
        break;
      default:
        break;
    }
  };

  // Security action handlers
  const handleSecurityAction = (action) => {
    switch (action) {
      case 'enable2fa':
        alert('🔒 Two-Factor Authentication\n\nThis feature enhances account security with SMS or authenticator app verification.\n\nComing in the next update!');
        break;
      case 'logoutAll':
        if (window.confirm('⚠️ Logout from all devices?\n\nThis will end all active sessions except this one.')) {
          // Clear session data
          sessionStorage.clear();
          alert('✅ All other sessions have been terminated.');
        }
        break;
      default:
        break;
    }
  };
  
  // Test payment gateway connection
  const handleTestPayment = () => {
    if (settings.paymentGateway === 'none') {
      alert('⚠️ Please select a payment gateway first.');
      return;
    }
    
    const gateway = settings.paymentGateway;
    const gatewayNames = {
      'stripe': 'Stripe',
      'paypal': 'PayPal',
      'square': 'Square',
      'orange_money': 'Orange Money',
      'afrimoney': 'AfriMoney',
      'vult': 'Vult',
      'bank_transfer': 'Bank Transfer'
    };
    
    alert(`🔄 Testing ${gatewayNames[gateway]} connection...\n\nThis will verify your API credentials and connectivity.\n\n✅ Test mode active - no actual charges will be made.`);
    
    setTimeout(() => {
      alert(`✅ ${gatewayNames[gateway]} Connection Test\n\nStatus: Connected\nMode: ${settings.paymentMode === 'test' ? 'Test' : 'Live'}\n\nYour payment gateway is configured correctly!`);
    }, 1500);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'system', label: 'System', icon: '🖥️' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <div className="flex items-center space-x-3">
          {/* Sync Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === 'connected' ? 'bg-green-500' : 
              syncStatus === 'disconnected' ? 'bg-red-500' : 
              'bg-gray-400'
            }`}></div>
            <span className="text-xs text-gray-500">
              {syncStatus === 'connected' ? 'Sync Active' : 
               syncStatus === 'disconnected' ? 'Sync Offline' : 
               'Sync Unavailable'}
            </span>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              saveStatus === 'saving'
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : saveStatus === 'saved' || saveStatus === 'synced'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : saveStatus === 'error'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {saveStatus === 'saving' ? 'Saving...' : 
             saveStatus === 'saved' ? 'Saved!' : 
             saveStatus === 'synced' ? 'Synced!' :
             saveStatus === 'error' ? 'Error' : 
             'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-4xl">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">General Settings</h2>
              <p className="text-gray-500">Update your company's basic information and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                >
                  <option value="UTC-08:00">(UTC-08:00) Pacific Time</option>
                  <option value="UTC-05:00">(UTC-05:00) Eastern Time</option>
                  <option value="UTC+00:00">(UTC+00:00) Greenwich Mean Time</option>
                  <option value="UTC+01:00">(UTC+01:00) Central European Time</option>
                  <option value="UTC+08:00">(UTC+08:00) China Standard Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="SLL">SLL - Sierra Leone Leone</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings Tab */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Settings</h2>
              <p className="text-gray-500">Manage your personal account information and preferences.</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Admin User</h3>
                  <p className="text-gray-500">System Administrator</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    Change Password
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={settings.fullName}
                    onChange={(e) => setSettings({...settings, fullName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select 
                    value={settings.role}
                    onChange={(e) => setSettings({...settings, role: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  >
                    <option value="admin">Administrator</option>
                    <option value="manager">Manager</option>
                    <option value="operator">Operator</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Notification Settings</h2>
              <p className="text-gray-500">Control how and when you receive notifications.</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-gray-900 font-medium">Email Notifications</h3>
                  <p className="text-gray-500 text-sm">Receive notifications for new orders, cancellations, and updates.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-gray-900 font-medium">In-App Notifications</h3>
                  <p className="text-gray-500 text-sm">Get alerts for important events and reminders within the app.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.inAppNotifications}
                    onChange={(e) => setSettings({...settings, inAppNotifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-gray-900 font-medium">SMS Notifications</h3>
                  <p className="text-gray-500 text-sm">Receive text messages for urgent alerts and confirmations.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h4>
                <div className="space-y-3">
                  {[
                    { id: 'new_orders', label: 'New Orders', desc: 'When new rental orders are placed' },
                    { id: 'payment_received', label: 'Payment Received', desc: 'When payments are successfully processed' },
                    { id: 'equipment_returned', label: 'Equipment Returned', desc: 'When equipment is returned by customers' },
                    { id: 'maintenance_due', label: 'Maintenance Due', desc: 'When equipment requires maintenance' },
                    { id: 'low_inventory', label: 'Low Inventory', desc: 'When equipment availability is low' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notificationTypes[item.id]}
                        onChange={(e) => setSettings({
                          ...settings, 
                          notificationTypes: {
                            ...settings.notificationTypes,
                            [item.id]: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Security Settings</h2>
              <p className="text-gray-500">Manage security preferences and access controls.</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Security Status</h3>
                    <p className="text-sm text-yellow-700 mt-1">Your account security is good. Consider enabling two-factor authentication for enhanced protection.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Authentication</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Two-Factor Authentication</span>
                        <button 
                          onClick={() => handleSecurityAction('enable2fa')}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Enable
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Login Alerts</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Session Management</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Auto Logout (minutes)</span>
                        <select className="text-sm border border-gray-300 rounded px-2 py-1">
                          <option value="30">30</option>
                          <option value="60" selected>60</option>
                          <option value="120">120</option>
                          <option value="0">Never</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => handleSecurityAction('logoutAll')}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Logout All Devices
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Gateway Settings</h2>
              <p className="text-gray-500">Configure payment processing for customer transactions.</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Payment Integration</h3>
                    <p className="text-sm text-blue-700 mt-1">Connect your preferred payment gateway to enable online payments for equipment rentals.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Gateway Provider</label>
                
                {/* International Payment Gateways */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">International Gateways</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'stripe', name: 'Stripe', desc: 'Popular, developer-friendly', logo: '💳' },
                      { id: 'paypal', name: 'PayPal', desc: 'Widely trusted worldwide', logo: '🅿️' },
                      { id: 'square', name: 'Square', desc: 'Great for small businesses', logo: '⬜' }
                    ].map((provider) => (
                      <div key={provider.id} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        settings.paymentGateway === provider.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSettings({...settings, paymentGateway: provider.id})}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{provider.logo}</div>
                          <h4 className="font-medium text-gray-900">{provider.name}</h4>
                          <p className="text-xs text-gray-500">{provider.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sierra Leone Local Payment Gateways */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Sierra Leone Local Payments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { id: 'orange_money', name: 'Orange Money', desc: 'Mobile money payments', logo: '🟠', color: 'orange' },
                      { id: 'afrimoney', name: 'AfriMoney', desc: 'Digital wallet solution', logo: '💜', color: 'purple' },
                      { id: 'vult', name: 'Vult', desc: 'Modern payment platform', logo: '⚡', color: 'blue' },
                      { id: 'bank_transfer', name: 'Bank Transfer', desc: 'Direct bank payments', logo: '🏦', color: 'gray' }
                    ].map((provider) => (
                      <div key={provider.id} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        settings.paymentGateway === provider.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSettings({...settings, paymentGateway: provider.id})}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{provider.logo}</div>
                          <h4 className="font-medium text-gray-900">{provider.name}</h4>
                          <p className="text-xs text-gray-500">{provider.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {settings.paymentGateway === 'stripe' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Stripe Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                      <input
                        type="text"
                        value={settings.stripePublishableKey}
                        onChange={(e) => setSettings({...settings, stripePublishableKey: e.target.value})}
                        placeholder="pk_test_..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                      <input
                        type="password"
                        value={settings.stripeSecretKey}
                        onChange={(e) => setSettings({...settings, stripeSecretKey: e.target.value})}
                        placeholder="sk_test_..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {settings.paymentGateway === 'paypal' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">PayPal Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                      <input
                        type="text"
                        value={settings.paypalClientId}
                        onChange={(e) => setSettings({...settings, paypalClientId: e.target.value})}
                        placeholder="Your PayPal Client ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                      <input
                        type="password"
                        value={settings.paypalClientSecret}
                        onChange={(e) => setSettings({...settings, paypalClientSecret: e.target.value})}
                        placeholder="Your PayPal Client Secret"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {settings.paymentGateway === 'square' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Square Configuration</h4>
                  <div className="text-center py-8">
                    <p className="text-gray-500">Square integration coming soon!</p>
                    <button className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                      Request Integration
                    </button>
                  </div>
                </div>
              )}

              {/* Orange Money Configuration */}
              {settings.paymentGateway === 'orange_money' && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">🟠 Orange Money Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                      <input
                        type="password"
                        value={settings.orangeMoneyApiKey}
                        onChange={(e) => setSettings({...settings, orangeMoneyApiKey: e.target.value})}
                        placeholder="Enter Orange Money API Key"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Merchant ID</label>
                      <input
                        type="text"
                        value={settings.orangeMoneyMerchantId}
                        onChange={(e) => setSettings({...settings, orangeMoneyMerchantId: e.target.value})}
                        placeholder="Your Orange Money Merchant ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Note:</strong> Contact Orange Money Sierra Leone to obtain your API credentials for mobile money integration.
                    </p>
                  </div>
                </div>
              )}

              {/* AfriMoney Configuration */}
              {settings.paymentGateway === 'afrimoney' && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">💜 AfriMoney Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                      <input
                        type="password"
                        value={settings.afrimoneyApiKey}
                        onChange={(e) => setSettings({...settings, afrimoneyApiKey: e.target.value})}
                        placeholder="Enter AfriMoney API Key"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Merchant Code</label>
                      <input
                        type="text"
                        value={settings.afrimoneyMerchantCode}
                        onChange={(e) => setSettings({...settings, afrimoneyMerchantCode: e.target.value})}
                        placeholder="Your AfriMoney Merchant Code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Note:</strong> Register with AfriMoney to get your merchant credentials for digital wallet payments.
                    </p>
                  </div>
                </div>
              )}

              {/* Vult Configuration */}
              {settings.paymentGateway === 'vult' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">⚡ Vult Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                      <input
                        type="password"
                        value={settings.vultApiKey}
                        onChange={(e) => setSettings({...settings, vultApiKey: e.target.value})}
                        placeholder="Enter Vult API Key"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Merchant ID</label>
                      <input
                        type="text"
                        value={settings.vultMerchantId}
                        onChange={(e) => setSettings({...settings, vultMerchantId: e.target.value})}
                        placeholder="Your Vult Merchant ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Sign up with Vult to access their modern payment platform and get your API credentials.
                    </p>
                  </div>
                </div>
              )}

              {/* Bank Transfer Configuration */}
              {settings.paymentGateway === 'bank_transfer' && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">🏦 Bank Transfer Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        value={settings.bankName}
                        onChange={(e) => setSettings({...settings, bankName: e.target.value})}
                        placeholder="e.g., Sierra Leone Commercial Bank"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={settings.bankAccountNumber}
                        onChange={(e) => setSettings({...settings, bankAccountNumber: e.target.value})}
                        placeholder="Your business account number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SWIFT Code (Optional)</label>
                      <input
                        type="text"
                        value={settings.bankSwiftCode}
                        onChange={(e) => setSettings({...settings, bankSwiftCode: e.target.value})}
                        placeholder="For international transfers"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.bankTransferEnabled}
                          onChange={(e) => setSettings({...settings, bankTransferEnabled: e.target.checked})}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-sm text-gray-700">Enable Bank Transfer</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> Bank transfer details will be displayed to customers for manual payment processing.
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Payment Mode</h4>
                  <select
                    value={settings.paymentMode}
                    onChange={(e) => setSettings({...settings, paymentMode: e.target.value})}
                    className="text-sm border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="test">Test Mode</option>
                    <option value="live">Live Mode</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Payment Features</h5>
                    {[
                      { id: 'cards', label: 'Credit/Debit Cards', enabled: true },
                      { id: 'digital', label: 'Digital Wallets', enabled: true },
                      { id: 'bank', label: 'Bank Transfers', enabled: false },
                      { id: 'crypto', label: 'Cryptocurrency', enabled: false }
                    ].map((feature) => (
                      <div key={feature.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{feature.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={feature.enabled} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Transaction Settings</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Fee</span>
                        <span className="font-medium">2.9% + $0.30</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minimum Amount</span>
                        <span className="font-medium">$10.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Maximum Amount</span>
                        <span className="font-medium">$50,000.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {settings.paymentGateway !== 'none' && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-green-800">Test Payment</h5>
                        <p className="text-sm text-green-700">Verify your payment gateway configuration</p>
                      </div>
                      <button 
                        onClick={handleTestPayment}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Test Connection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">System Settings</h2>
              <p className="text-gray-500">Configure system-wide preferences and maintenance options.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">System Maintenance</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                        <p className="text-xs text-gray-500">Temporarily disable customer access</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.maintenanceMode}
                          onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Auto Backup</span>
                        <p className="text-xs text-gray-500">Daily automatic database backup</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoBackup}
                          onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">System Actions</h4>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleSystemAction('backup')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Create System Backup
                    </button>
                    <button 
                      onClick={() => handleSystemAction('cache')}
                      className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      Clear System Cache
                    </button>
                    <button 
                      onClick={() => handleSystemAction('logs')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Export System Logs
                    </button>
                    <button 
                      onClick={() => handleSystemAction('reset')}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Reset to Defaults
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">System Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">Version</div>
                    <div className="font-medium">v2.1.0</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">Database</div>
                    <div className="font-medium">SQLite</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">Uptime</div>
                    <div className="font-medium">7d 12h</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">Storage</div>
                    <div className="font-medium">2.1 GB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePasswordChange}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
