import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state;
  
  const [processing, setProcessing] = useState(false);

  if (!bookingData) {
    return (
      <div className="payment-container">
        <div className="payment-error">
          <h2>No Booking Data</h2>
          <p>Please start from the equipment booking page.</p>
          <button onClick={() => navigate('/products')} className="back-btn">
            Back to Equipment
          </button>
        </div>
      </div>
    );
  }

  const getPaymentMethodDisplay = (method) => {
    switch(method) {
      case 'orange_money': return 'Orange Money';
      case 'mtn_money': return 'MTN Mobile Money';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash on Delivery';
      default: return 'Credit/Debit Card';
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Try to update order via API, fallback to demo mode
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://rslaf-backend.onrender.com'}/orders/${bookingData.orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'paid',
            payment_status: 'completed',
            delivery_status: 'ready for delivery'
          })
        });

        if (!response.ok) {
          throw new Error('API update failed');
        }
      } catch (apiError) {
        console.log('API not available, updating demo order');
        // Update demo order in localStorage
        const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
        const orderIndex = demoOrders.findIndex(order => order.id === bookingData.orderId);
        if (orderIndex !== -1) {
          demoOrders[orderIndex].status = 'paid';
          demoOrders[orderIndex].payment_status = 'completed';
          demoOrders[orderIndex].delivery_status = 'ready for delivery';
          demoOrders[orderIndex].updated_at = new Date().toISOString(); // Add update timestamp
          localStorage.setItem('demoOrders', JSON.stringify(demoOrders));

          // Trigger event for admin portal to refresh
          window.dispatchEvent(new Event('orderUpdated'));
        }
      }

      alert('🎉 Payment Successful!\n\nYour equipment rental has been confirmed and is ready for delivery.\nWe will contact you shortly with pickup details.');
      navigate('/products');
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Payment failed. Please try again or contact support.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-container">
      <button onClick={() => navigate(-1)} className="back-btn">← Back to Booking</button>
      
      <div className="payment-header">
        <h1>Complete Payment</h1>
        <p className="payment-subtitle">Review your booking and complete the payment</p>
      </div>

      <div className="payment-content">
        <div className="booking-summary">
          <h3>📋 Booking Summary</h3>
          <div className="summary-item">
            <span>Equipment:</span>
            <span>{bookingData.product.name}</span>
          </div>
          <div className="summary-item">
            <span>Customer:</span>
            <span>{bookingData.customerInfo.name}</span>
          </div>
          <div className="summary-item">
            <span>Duration:</span>
            <span>{bookingData.totalHours} hours</span>
          </div>
          <div className="summary-item">
            <span>Start Date:</span>
            <span>{bookingData.startDate}</span>
          </div>
          <div className="summary-item total">
            <span>Total Amount:</span>
            <span>${bookingData.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="payment-method-display">
          <h3>💳 Payment Method</h3>
          <div className="selected-method">
            {getPaymentMethodDisplay(bookingData.paymentMethod)}
          </div>
        </div>
      </div>

      <div className="payment-actions">
        <button 
          className="pay-btn" 
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? '⏳ Processing Payment...' : `💰 Pay $${bookingData.totalPrice.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default Payment;
