import React, { useState, useEffect } from 'react';

const LateReturnWarning = () => {
  const [lateRentals, setLateRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLateReturns();
    // Check every 5 minutes
    const interval = setInterval(checkLateReturns, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkLateReturns = async () => {
    try {
      // Get customer phone from localStorage if available
      const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || '{}');
      const phone = customerInfo.phone;

      if (!phone) {
        setLoading(false);
        return;
      }

      const isProduction = window.location.hostname.includes('onrender.com');
      const apiUrl = isProduction
        ? 'https://rslaf-backend.onrender.com'
        : 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/orders/public/check-late-returns?customer_phone=${encodeURIComponent(phone)}`);
      
      if (response.ok) {
        const data = await response.json();
        setLateRentals(data.late_rentals || []);
      }
    } catch (error) {
      console.error('Failed to check late returns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || lateRentals.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-orange-800">
            Late Return Notice - Extra Charges Apply
          </h3>
          <div className="mt-2 text-sm text-orange-700">
            <p className="mb-2">
              You have {lateRentals.length} rental{lateRentals.length > 1 ? 's' : ''} that {lateRentals.length > 1 ? 'are' : 'is'} past the expected return time. 
              You are being charged for the extra rental time.
            </p>
            <ul className="list-disc list-inside space-y-1">
              {lateRentals.map((rental) => (
                <li key={rental.order_id}>
                  <strong>{rental.equipment_name}</strong> - {rental.hours_overdue} hours overdue
                  <span className="text-xs text-orange-600 ml-2">
                    (Order #{rental.order_id})
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-semibold">
              Please return the equipment as soon as possible to avoid additional charges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LateReturnWarning;
