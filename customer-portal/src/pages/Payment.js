import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency, convertUSDToSLL } from '../utils/currency';
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
      // Convert USD to SLL for Un Punto payment
      const amountInSLL = convertUSDToSLL(bookingData.totalPrice);
      console.log('🔄 Initiating Un Punto payment...');
      console.log('📊 Amount in USD:', bookingData.totalPrice);
      console.log('📊 Amount in SLL:', amountInSLL);
      
      const response = await fetch('https://odprta-tocka.onrender.com/api/monime/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'RSLAF-Equipment-Rental',
          amount: parseFloat(amountInSLL) // Send in SLL
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
        
        // Customer will click "I've completed payment" button to start status checking
        
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
        amount: bookingData.totalPrice,
        currency: 'SLL' // Sierra Leone Leones
      };

      // Try to update order via API - backend will auto-set status to paid_awaiting_delivery/pickup
      try {
        // Determine API URL based on environment
        const isProduction = window.location.hostname.includes('onrender.com');
        const apiUrl = isProduction 
          ? `https://rslaf-backend.onrender.com/orders/public/update/${bookingData.orderId}`
          : `http://localhost:3001/api/orders/${bookingData.orderId}`;
        
        const sharedApiResponse = await fetch(apiUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_details: paymentDetails,
            delivery_method: bookingData.deliveryMethod || 'pickup', // 'pickup' or 'delivery'
            updated_at: new Date().toISOString()
          })
        });

        if (sharedApiResponse.ok) {
          console.log('✅ Order updated via API');
        } else {
          // If the order doesn't exist (404), create it now (hourly-flow safety net)
          if (sharedApiResponse.status === 404) {
            console.warn('⚠️ Order not found during update. Creating order now before retry...');
            const createUrl = 'https://rslaf-backend.onrender.com/orders/public/create-simple';
            const nowIso = new Date().toISOString();
            const startIso = bookingData.rentalType === 'dateRange' ? (bookingData.startDate ? `${bookingData.startDate}T${bookingData.startTime || '00:00'}:00` : nowIso) : nowIso;
            const endIso = bookingData.rentalType === 'dateRange'
              ? (bookingData.endDate ? `${bookingData.endDate}T${bookingData.endTime || '00:00'}:00` : nowIso)
              : new Date(Date.now() + (parseFloat(bookingData.totalHours || 1) * 60 * 60 * 1000)).toISOString();

            const createPayload = {
              name: bookingData.customerInfo?.name,
              email: bookingData.customerInfo?.email,
              phone: bookingData.customerInfo?.phone,
              equipment_name: bookingData.product?.name,
              total_price: bookingData.totalPrice,
              payment_method: bookingData.paymentMethod,
              start_date: startIso,
              end_date: endIso,
              total_hours: bookingData.rentalType === 'dateRange' ? (bookingData.totalHours || bookingData.calculatedHours) : parseFloat(bookingData.totalHours || 1)
            };

            const createRes = await fetch(createUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(createPayload)
            });

            if (!createRes.ok) {
              const txt = await createRes.text();
              throw new Error(`Failed to create order before update. ${createRes.status}: ${txt}`);
            }
            const created = await createRes.json();
            console.log('✅ Created order on-the-fly:', created);
            bookingData.orderId = created.id;

            // Retry update with the new order id
            const retryUrl = `https://rslaf-backend.onrender.com/orders/public/update/${bookingData.orderId}`;
            const retryRes = await fetch(retryUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                payment_details: paymentDetails,
                delivery_method: bookingData.deliveryMethod || 'pickup',
                updated_at: new Date().toISOString()
              })
            });
            if (!retryRes.ok) {
              const t = await retryRes.text();
              throw new Error(`Retry update failed: ${retryRes.status} ${t}`);
            }
            console.log('✅ Order updated after creating on-the-fly');
          } else {
            throw new Error('Shared API failed, trying main API');
          }
        }
      } catch (sharedApiError) {
        console.log('⚠️ Shared API not available, trying main API');
        
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://rslaf-backend.onrender.com'}/orders/public/update/${bookingData.orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payment_details: paymentDetails,
              delivery_method: bookingData.deliveryMethod || 'pickup',
              updated_at: new Date().toISOString()
            })
          });

          if (!response.ok) {
            // If still not found on public update endpoint, try the same create-on-the-fly fallback
            if (response.status === 404) {
              console.warn('⚠️ Main API update returned 404. Creating order now and retrying...');
              const createUrl = 'https://rslaf-backend.onrender.com/orders/public/create-simple';
              const nowIso = new Date().toISOString();
              const startIso = bookingData.rentalType === 'dateRange' ? (bookingData.startDate ? `${bookingData.startDate}T${bookingData.startTime || '00:00'}:00` : nowIso) : nowIso;
              const endIso = bookingData.rentalType === 'dateRange'
                ? (bookingData.endDate ? `${bookingData.endDate}T${bookingData.endTime || '00:00'}:00` : nowIso)
                : new Date(Date.now() + (parseFloat(bookingData.totalHours || 1) * 60 * 60 * 1000)).toISOString();

              const createPayload = {
                name: bookingData.customerInfo?.name,
                email: bookingData.customerInfo?.email,
                phone: bookingData.customerInfo?.phone,
                equipment_name: bookingData.product?.name,
                total_price: bookingData.totalPrice,
                payment_method: bookingData.paymentMethod,
                start_date: startIso,
                end_date: endIso,
                total_hours: bookingData.rentalType === 'dateRange' ? (bookingData.totalHours || bookingData.calculatedHours) : parseFloat(bookingData.totalHours || 1)
              };

              const createRes = await fetch(createUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createPayload)
              });
              if (!createRes.ok) {
                const txt = await createRes.text();
                throw new Error(`Failed to create order before update (main API path). ${createRes.status}: ${txt}`);
              }
              const created = await createRes.json();
              console.log('✅ Created order (main path) on-the-fly:', created);
              bookingData.orderId = created.id;

              const retryUrl = `https://rslaf-backend.onrender.com/orders/public/update/${bookingData.orderId}`;
              const retryRes = await fetch(retryUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  payment_details: paymentDetails,
                  delivery_method: bookingData.deliveryMethod || 'pickup',
                  updated_at: new Date().toISOString()
                })
              });
              if (!retryRes.ok) {
                const t = await retryRes.text();
                throw new Error(`Retry update (main path) failed: ${retryRes.status} ${t}`);
              }
              console.log('✅ Order updated after creating (main path) on-the-fly');
            } else {
              throw new Error('API update failed');
            }
          }
          
          console.log('✅ Order updated via main API (public)');
        } catch (apiError) {
          console.log('📱 API not available, updating local storage', apiError);
          
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
            <span>Total Amount (USD):</span>
            <span>${bookingData.totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-item total" style={{ backgroundColor: '#e8f5e9', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>Total Amount (SLL):</span>
            <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{formatCurrency(convertUSDToSLL(bookingData.totalPrice))}</span>
          </div>
          <div className="summary-item" style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', marginTop: '0.5rem' }}>
            <span>Exchange Rate:</span>
            <span>$1 USD = Le 24 SLL</span>
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
                  <p><strong>Amount (USD):</strong> ${bookingData.totalPrice.toFixed(2)}</p>
                  <p><strong>Amount (SLL):</strong> {formatCurrency(convertUSDToSLL(bookingData.totalPrice))}</p>
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
             `📱 Pay ${formatCurrency(convertUSDToSLL(bookingData.totalPrice))} with ${getPaymentMethodDisplay(bookingData.paymentMethod)}` :
             `💰 Pay $${bookingData.totalPrice.toFixed(2)} (${formatCurrency(convertUSDToSLL(bookingData.totalPrice))})`}
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
