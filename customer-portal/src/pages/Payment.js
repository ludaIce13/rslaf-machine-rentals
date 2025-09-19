import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state;
  
  const [paymentMethod, setPaymentMethod] = useState('card');
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

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Create order in backend
      const orderData = {
        customer_id: 1,
        product_id: bookingData.product.id,
        rental_type: bookingData.rentalType,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        total_hours: bookingData.totalHours,
        total_price: bookingData.totalPrice,
        payment_method: paymentMethod,
        customer_info: bookingData.customerInfo,
        status: 'confirmed'
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://rslaf-backend.onrender.com'}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert('Payment successful! Your equipment rental has been confirmed.');
        navigate('/products');
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>Payment</h1>
      </div>

      <div className="payment-content">
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item">
            <span>Equipment:</span>
            <span>{bookingData.product.name}</span>
          </div>
          <div className="summary-item">
            <span>Duration:</span>
            <span>{bookingData.totalHours} hours</span>
          </div>
          <div className="summary-item total">
            <span>Total:</span>
            <span>${bookingData.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Payment Method</h3>
          <div className="payment-options">
            <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
              <input 
                type="radio" 
                value="card" 
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Credit/Debit Card</span>
            </label>
            <label className={`payment-option ${paymentMethod === 'bank' ? 'selected' : ''}`}>
              <input 
                type="radio" 
                value="bank" 
                checked={paymentMethod === 'bank'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Bank Transfer</span>
            </label>
            <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
              <input 
                type="radio" 
                value="cash" 
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>

        <button 
          className="pay-btn" 
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? 'Processing...' : `Pay $${bookingData.totalPrice.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default Payment;
