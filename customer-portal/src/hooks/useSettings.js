import { useState, useEffect } from 'react';

const SETTINGS_API_URL = 'http://localhost:3002/api/settings';

export const useSettings = () => {
  const [settings, setSettings] = useState({
    companyName: 'RSLAF Machine Rentals',
    timezone: 'UTC-08:00',
    currency: 'USD',
    theme: 'light',
    maintenanceMode: false,
    paymentGateway: 'none',
    orangeMoneyApiKey: '',
    orangeMoneyMerchantId: '',
    afrimoneyApiKey: '',
    afrimoneyMerchantCode: '',
    vultApiKey: '',
    vultMerchantId: '',
    bankTransferEnabled: false,
    paymentMode: 'test'
  });
  
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('disconnected');

  // Load settings from API
  const loadSettings = async () => {
    try {
      const response = await fetch(SETTINGS_API_URL);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        console.log('✅ Customer portal settings loaded from API');
        
        // Also save to localStorage as backup
        localStorage.setItem('rslaf_customer_settings', JSON.stringify(data));
      } else {
        // Fallback to localStorage
        const localSettings = localStorage.getItem('rslaf_customer_settings');
        if (localSettings) {
          setSettings(JSON.parse(localSettings));
          console.log('📱 Customer portal using cached settings');
        }
      }
    } catch (error) {
      console.warn('⚠️ Customer portal settings API not available:', error);
      
      // Fallback to localStorage
      const localSettings = localStorage.getItem('rslaf_customer_settings');
      if (localSettings) {
        setSettings(JSON.parse(localSettings));
        console.log('📱 Customer portal using cached settings');
      }
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time sync
  const setupRealTimeSync = () => {
    try {
      const eventSource = new EventSource(`${SETTINGS_API_URL}/sync`);
      
      eventSource.onopen = () => {
        setSyncStatus('connected');
        console.log('📡 Customer portal settings sync connected');
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'settings_updated') {
            setSettings(data.data);
            console.log('🔄 Customer portal settings updated from sync:', data.data);
            
            // Save to localStorage
            localStorage.setItem('rslaf_customer_settings', JSON.stringify(data.data));
            
            // Dispatch custom event for components that need to react
            window.dispatchEvent(new CustomEvent('customerSettingsUpdated', { 
              detail: data.data 
            }));
          }
        } catch (error) {
          console.error('❌ Customer portal sync error:', error);
        }
      };
      
      eventSource.onerror = () => {
        setSyncStatus('disconnected');
        console.warn('⚠️ Customer portal settings sync disconnected');
      };
      
      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.warn('⚠️ Customer portal could not setup real-time sync:', error);
      setSyncStatus('unavailable');
    }
  };

  useEffect(() => {
    loadSettings();
    const cleanup = setupRealTimeSync();
    
    return cleanup;
  }, []);

  // Helper functions
  const formatCurrency = (amount) => {
    const currencySymbol = settings.currency === 'USD' ? '$' : 
                          settings.currency === 'EUR' ? '€' : 
                          settings.currency === 'GBP' ? '£' : 
                          settings.currency;
    return `${currencySymbol}${parseFloat(amount || 0).toFixed(2)}`;
  };

  const isMaintenanceMode = () => {
    return settings.maintenanceMode;
  };

  const getPaymentMethods = () => {
    const methods = [];
    
    if (settings.orangeMoneyApiKey) {
      methods.push({ id: 'orange_money', name: 'Orange Money', enabled: true });
    }
    
    if (settings.afrimoneyApiKey) {
      methods.push({ id: 'afri_money', name: 'Afri Money', enabled: true });
    }
    
    if (settings.vultApiKey) {
      methods.push({ id: 'vult', name: 'Vult', enabled: true });
    }
    
    if (settings.bankTransferEnabled) {
      methods.push({ id: 'bank_transfer', name: 'Bank Transfer', enabled: true });
    }
    
    return methods;
  };

  return {
    settings,
    loading,
    syncStatus,
    formatCurrency,
    isMaintenanceMode,
    getPaymentMethods,
    reload: loadSettings
  };
};

export default useSettings;
