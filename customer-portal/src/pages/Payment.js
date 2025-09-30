import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state;
  
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('initial'); // 'initial', 'ussd', 'checking', 'completed', 'failed'
  const [ussdCode, setUssdCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [paymentFeedback, setPaymentFeedback] = useState({
    show: false,
    type: '', // 'success', 'pending', 'failed'
    message: '',
    orderId: null,
    transactionId: null
  });

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
      case 'afri_money': return 'Afri Money';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash on Delivery';
      default: return 'Credit/Debit Card';
    }
  };

  const initiateUnPuntoPayment = async () => {
    setProcessing(true);
    
    try {
      console.log('🔄 Initiating Un Punto payment...');
      console.log('📊 Amount:', bookingData.totalPrice);
      
      const response = await fetch('https://odprta-tocka.onrender.com/api/monime/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'RSLAF-Equipment-Rental',
          amount: parseFloat(bookingData.totalPrice)
        })
      });

      console.log('📡 Un Punto API Response Status:', response.status);
      const data = await response.json();
      console.log('📊 Un Punto API Response Data:', data);
      
      if (response.ok && data.reqstatus === 'completed') {
        console.log('✅ USSD Code:', data.ussdCode);
        console.log('✅ Transaction ID:', data.transactionId);
        
        setUssdCode(data.ussdCode);
        setTransactionId(data.transactionId);
        setPaymentStep('ussd');
        
        // Start checking payment status after 30 seconds
        setTimeout(() => {
          startStatusChecking();
        }, 30000);
        
      } else {
        console.error('❌ Un Punto API Error:', data);
        throw new Error(data.message || 'Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('❌ Un Punto payment error:', error);
      setPaymentFeedback({
        show: true,
        type: 'failed',
        message: `Payment initiation failed: ${error.message}. Please try another payment method or contact support.`,
        orderId: bookingData.orderId,
        transactionId: null
      });
      setPaymentStep('failed');
    } finally {
      setProcessing(false);
    }
  };

  const startStatusChecking = () => {
    setPaymentStep('checking');
    setPaymentFeedback({
      show: true,
      type: 'pending',
      message: 'Checking payment status...',
      orderId: bookingData.orderId,
      transactionId: transactionId
    });
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`https://odprta-tocka.onrender.com/api/monime/payment-status/RSLAF-Equipment-Rental/${transactionId}`);
        const data = await response.json();
        
        if (response.ok) {
          setPaymentStatus(data.paymentStatus);
          
          // Update feedback message based on status
          setPaymentFeedback(prev => ({
            ...prev,
            type: 'pending',
            message: `Payment status: ${data.paymentStatus.toUpperCase()}`
          }));
          
          if (data.paymentStatus === 'completed') {
            clearInterval(interval);
            setStatusCheckInterval(null);
            setPaymentFeedback({
              show: true,
              type: 'success',
              message: 'Payment completed successfully!',
              orderId: bookingData.orderId,
              transactionId: transactionId
            });
            await completePayment(data);
          } else if (data.paymentStatus === 'expired' || data.paymentStatus === 'cancelled' || data.paymentStatus === 'failed') {
            clearInterval(interval);
            setStatusCheckInterval(null);
            setPaymentStep('failed');
            setPaymentFeedback({
              show: true,
              type: 'failed',
              message: `Payment ${data.paymentStatus}. Please try again.`,
              orderId: bookingData.orderId,
              transactionId: transactionId
            });
          }
        }
      } catch (error) {
        console.error('Status check error:', error);
        setPaymentFeedback(prev => ({
          ...prev,
          message: 'Error checking payment status. Retrying...'
        }));
      }
    }, 10000); // Check every 10 seconds
    
    setStatusCheckInterval(interval);
    
    // Stop checking after 15 minutes (USSD code expires)
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setStatusCheckInterval(null);
        if (paymentStep === 'checking') {
          setPaymentStep('failed');
          setPaymentFeedback({
            show: true,
            type: 'failed',
            message: 'Payment timeout. USSD code expired. Please try again.',
            orderId: bookingData.orderId,
            transactionId: transactionId
          });
        }
      }
    }, 15 * 60 * 1000);
  };

  const completePayment = async (paymentData) => {
    setPaymentStep('completed');
    await handlePaymentSuccess(paymentData);
  };

  const handlePayment = async () => {
    // Check if this is a local payment method (Orange Money or Afri Money)
    if (bookingData.paymentMethod === 'orange_money' || bookingData.paymentMethod === 'afri_money') {
      await initiateUnPuntoPayment();
    } else {
      // Handle other payment methods (existing logic)
      await handlePaymentSuccess();
    }
  };

  const handlePaymentSuccess = async (paymentData = {}) => {
    setProcessing(true);
    
    try {
      const paymentDetails = {
        transactionId: transactionId || paymentData.transactionId,
        paymentMethod: bookingData.paymentMethod,
        paymentStatus: 'completed',
        paymentDate: new Date().toISOString(),
        amount: bookingData.totalPrice,
        currency: 'SLL' // Sierra Leone Leones
      };

      // Try to update order via API, fallback to demo mode
      try {
        // Determine API URL based on environment
        const isProduction = window.location.hostname.includes('onrender.com');
        const apiUrl = isProduction 
          ? `https://rslaf-backend.onrender.com/orders/${bookingData.orderId}`
          : `http://localhost:3001/api/orders/${bookingData.orderId}`;
        
        const sharedApiResponse = await fetch(apiUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'paid',
            payment_status: 'completed',
            delivery_status: 'ready for delivery',
            payment_details: paymentDetails,
            updated_at: new Date().toISOString()
          })
        });

        if (sharedApiResponse.ok) {
          console.log('✅ Order updated via shared API');
        } else {
          throw new Error('Shared API failed, trying main API');
        }
      } catch (sharedApiError) {
        console.log('⚠️ Shared API not available, trying main API');
        
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/orders/${bookingData.orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'paid',
              payment_status: 'completed',
              delivery_status: 'ready for delivery',
              payment_details: paymentDetails,
              updated_at: new Date().toISOString()
            })
          });

          if (!response.ok) {
            throw new Error('API update failed');
          }
          
          console.log('✅ Order updated via main API');
        } catch (apiError) {
          console.log('📱 API not available, updating local storage');
          
          // Update order in localStorage
          const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
          const orderIndex = demoOrders.findIndex(order => order.id === bookingData.orderId);
          
          if (orderIndex !== -1) {
            demoOrders[orderIndex] = {
              ...demoOrders[orderIndex],
              status: 'paid',
              payment_status: 'completed',
              delivery_status: 'ready for delivery',
              payment_details: paymentDetails,
              updated_at: new Date().toISOString()
            };
            
            localStorage.setItem('demoOrders', JSON.stringify(demoOrders));

            // Trigger events for admin portal to refresh
            window.dispatchEvent(new Event('orderUpdated'));
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'demoOrders',
              newValue: JSON.stringify(demoOrders),
              url: window.location.href
            }));
            
            // Also try to notify parent window if in iframe
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'paymentCompleted', 
                orderId: bookingData.orderId,
                paymentDetails 
              }, '*');
            }
            
            console.log('💰 Payment completed for order:', bookingData.orderId);
            console.log('📊 Payment Details:', paymentDetails);
            console.log('📢 Payment events dispatched for admin portal');
          }
        }
      }

      // Send email notification to admin
      try {
        const emailData = {
          to: 'admin@rslaf.com',
          subject: `New Order: ${bookingData.product.name} - ${bookingData.customerInfo.name}`,
          html: `
            <h2>🎉 New Equipment Rental Order</h2>
            <h3>Customer Details:</h3>
            <ul>
              <li><strong>Name:</strong> ${bookingData.customerInfo.name}</li>
              <li><strong>Email:</strong> ${bookingData.customerInfo.email}</li>
              <li><strong>Phone:</strong> ${bookingData.customerInfo.phone}</li>
              <li><strong>Company:</strong> ${bookingData.customerInfo.company}</li>
              <li><strong>Address:</strong> ${bookingData.customerInfo.address}</li>
            </ul>
            
            <h3>Order Details:</h3>
            <ul>
              <li><strong>Equipment:</strong> ${bookingData.product.name}</li>
              <li><strong>Duration:</strong> ${bookingData.totalHours} hours</li>
              <li><strong>Start Date:</strong> ${bookingData.startDate}</li>
              <li><strong>End Date:</strong> ${bookingData.endDate}</li>
              <li><strong>Total Amount:</strong> $${bookingData.totalPrice}</li>
              <li><strong>Payment Method:</strong> ${bookingData.paymentMethod}</li>
              <li><strong>Order ID:</strong> ${bookingData.orderId}</li>
            </ul>
            
            <h3>📋 Quick Add to Admin Portal:</h3>
            <p>Copy these details to add manually:</p>
            <code>
              Customer: ${bookingData.customerInfo.name}<br>
              Equipment: ${bookingData.product.name}<br>
              Price: ${bookingData.totalPrice}<br>
              Hours: ${bookingData.totalHours}
            </code>
          `
        };

        // Send via EmailJS (free service)
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: 'service_e7chjko',  // Your Gmail service
            template_id: 'template_3mw5qwt', // Your order template
            user_id: 'eYCw2w7EHh4lIJ9zQ',     // Your public key
            template_params: {
              customer_name: bookingData.customerInfo.name,
              customer_email: bookingData.customerInfo.email,
              customer_phone: bookingData.customerInfo.phone,
              customer_company: bookingData.customerInfo.company,
              equipment_name: bookingData.product.name,
              total_hours: bookingData.totalHours,
              total_price: bookingData.totalPrice,
              payment_method: bookingData.paymentMethod,
              order_id: bookingData.orderId,
              to_email: 'rslafrentalservice@gmail.com' // Your admin email
            }
          })
        });
        
        console.log('📧 Order email sent to admin successfully');
      } catch (emailError) {
        console.log('⚠️ Could not send email notification:', emailError);
      }
      alert('🎉 Payment Successful!\n\nYour equipment rental has been confirmed and is ready for delivery.\nWe will contact you shortly with pickup details.\n\n📧 Admin has been notified via email.');
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

      {/* Un Punto Payment Steps */}
      {(bookingData.paymentMethod === 'orange_money' || bookingData.paymentMethod === 'afri_money') && paymentStep !== 'initial' && (
        <div className="unpunto-payment-steps">
          {paymentStep === 'ussd' && (
            <div className="ussd-step">
              <h3>📱 Complete Payment with USSD</h3>
              <div className="ussd-code-display">
                <p>Dial this USSD code on your phone:</p>
                <div className="ussd-code">{ussdCode}</div>
                <p className="ussd-instructions">
                  • Dial the code on your {bookingData.paymentMethod === 'orange_money' ? 'Orange Money' : 'Afri Money'} registered phone<br/>
                  • Follow the prompts to complete payment<br/>
                  • Code expires in 15 minutes
                </p>
              </div>
              <button 
                className="check-status-btn" 
                onClick={startStatusChecking}
                disabled={processing}
              >
                ✅ I've completed the payment - Check Status
              </button>
            </div>
          )}

          {paymentStep === 'checking' && (
            <div className="checking-step">
              <h3>🔄 Checking Payment Status</h3>
              <div className="status-checking">
                <div className="spinner"></div>
                <p>Verifying your payment...</p>
                <p className="status-text">Status: {paymentStatus || 'pending'}</p>
                <p className="wait-message">This may take a few moments. Please wait...</p>
              </div>
            </div>
          )}

          {paymentStep === 'completed' && (
            <div className="completed-step">
              <h3>✅ Payment Successful!</h3>
              <div className="success-message">
                <p>Your payment has been confirmed!</p>
                <p>Redirecting to equipment catalog...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Feedback Notification */}
      {paymentFeedback.show && (
        <div className={`payment-feedback ${paymentFeedback.type}`}>
          <div className="feedback-content">
            <div className="feedback-icon">
              {paymentFeedback.type === 'success' && '✅'}
              {paymentFeedback.type === 'pending' && '⏳'}
              {paymentFeedback.type === 'failed' && '❌'}
            </div>
            <div className="feedback-message">
              <h3>
                {paymentFeedback.type === 'success' && 'Payment Successful!'}
                {paymentFeedback.type === 'pending' && 'Payment Processing...'}
                {paymentFeedback.type === 'failed' && 'Payment Failed'}
              </h3>
              <p>{paymentFeedback.message}</p>
              {paymentFeedback.orderId && (
                <div className="feedback-details">
                  <p><strong>Order ID:</strong> {paymentFeedback.orderId}</p>
                  {paymentFeedback.transactionId && (
                    <p><strong>Transaction ID:</strong> {paymentFeedback.transactionId}</p>
                  )}
                  <p><strong>Amount:</strong> ${bookingData.totalPrice.toFixed(2)}</p>
                  <p><strong>Method:</strong> {getPaymentMethodDisplay(bookingData.paymentMethod)}</p>
                </div>
              )}
              {paymentFeedback.type === 'success' && (
                <div className="feedback-actions">
                  <button className="feedback-btn-primary" onClick={() => navigate('/products')}>
                    View More Equipment
                  </button>
                  <button className="feedback-btn-secondary" onClick={() => navigate('/orders')}>
                    View Order Status
                  </button>
                </div>
              )}
              {paymentFeedback.type === 'failed' && (
                <div className="feedback-actions">
                  <button className="feedback-btn-primary" onClick={() => {
                    setPaymentFeedback({ show: false, type: '', message: '', orderId: null, transactionId: null });
                    setPaymentStep('initial');
                    setUssdCode('');
                    setTransactionId('');
                  }}>
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="payment-actions">
        {paymentStep === 'initial' && (
          <button 
            className="pay-btn" 
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? '⏳ Processing Payment...' : 
             (bookingData.paymentMethod === 'orange_money' || bookingData.paymentMethod === 'afri_money') ? 
             `📱 Pay $${bookingData.totalPrice.toFixed(2)} with ${getPaymentMethodDisplay(bookingData.paymentMethod)}` :
             `💰 Pay $${bookingData.totalPrice.toFixed(2)}`}
          </button>
        )}
        
        {paymentStep !== 'initial' && paymentStep !== 'completed' && (
          <button 
            className="cancel-btn" 
            onClick={() => {
              if (statusCheckInterval) {
                clearInterval(statusCheckInterval);
                setStatusCheckInterval(null);
              }
              setPaymentStep('initial');
              setUssdCode('');
              setTransactionId('');
              setPaymentStatus('');
            }}
          >
            Cancel Payment
          </button>
        )}
      </div>
    </div>
  );
};

export default Payment;
