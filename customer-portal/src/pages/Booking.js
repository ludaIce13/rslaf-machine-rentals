import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../services/api';
import './Booking.css';

const Booking = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [rentalType, setRentalType] = useState('dateRange'); // 'dateRange' or 'hours'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [totalHours, setTotalHours] = useState('');
  const [calculatedEndDate, setCalculatedEndDate] = useState('');
  const [calculatedHours, setCalculatedHours] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('orange_money');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load product details from API
    const loadProduct = async () => {
      try {
        const response = await getProduct(productId);
        if (response.data) {
          // Ensure the product has all required fields with defaults
          // Get appropriate default image based on product name
          const getDefaultImage = (product) => {
            console.log('Booking page - getting fallback image for:', product.name);
            return 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=250&fit=crop&crop=center&auto=format&q=80';
          };

          // Fix image URL if it's a relative path
          let imageUrl = response.data.image_url;
          if (imageUrl && imageUrl.startsWith('/static/')) {
            const backendUrl = process.env.REACT_APP_API_URL || 'https://rslaf-backend.onrender.com';
            imageUrl = `${backendUrl}${imageUrl}`;
            console.log('Booking page - Converted relative path to full URL:', imageUrl);
          }

          const productData = {
            ...response.data,
            hourly_rate: response.data.hourly_rate || response.data.daily_rate || 100,
            available: response.data.available || 1,
            location: response.data.location || 'Main Yard',
            image_url: imageUrl || getDefaultImage(response.data)
          };
          setProduct(productData);
          return;
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      }
      
      // Fallback to demo data if API fails
      const constructionEquipment = [
        {
          id: 1,
          name: "CAT 320 Excavator",
          description: "Heavy-duty excavator perfect for digging, trenching, and demolition work. Features advanced hydraulics and operator comfort.",
          sku: "EXC-320",
          category: "Excavator",
          available: 3,
          location: "Downtown Yard",
          hourly_rate: 450,
          image_url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop"
        },
      {
        id: 2,
        name: "Mack Granite Dump Truck", 
        description: "Reliable dump truck for hauling materials, debris, and aggregate. Features a 15-yard capacity and excellent maneuverability.",
        sku: "DMP-001",
        category: "Dump Truck",
        available: 5,
        location: "North Yard",
        hourly_rate: 380,
        image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
      },
      {
        id: 3,
        name: "John Deere 410L Backhoe Loader",
        description: "Versatile backhoe loader combining loading and digging capabilities. Perfect for utility work and site preparation.",
        sku: "BCK-410",
        category: "Backhoe Loader", 
        available: 4,
        location: "Central Yard",
        hourly_rate: 320,
        image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop"
      },
      {
        id: 4,
        name: "CAT 950M Wheel Loader",
        description: "Powerful wheel loader designed for heavy material handling, loading trucks, and stockpile management.",
        sku: "WHL-950",
        category: "Wheel Loader",
        available: 2,
        location: "South Yard",
        hourly_rate: 520,
        image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop"
      },
      {
        id: 5,
        name: "Grove RT890E Rough Terrain Crane",
        description: "90-ton rough terrain crane ideal for construction sites with limited access. Features excellent mobility and lifting capacity.",
        sku: "CRN-890",
        category: "Crane",
        available: 1,
        location: "Downtown Yard",
        hourly_rate: 850,
        image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop"
      },
      {
        id: 6,
        name: "CAT D6T Bulldozer",
        description: "Medium bulldozer perfect for earthmoving, grading, and site preparation. Features excellent fuel efficiency.",
        sku: "BLD-D6T",
        category: "Bulldozer",
        available: 2,
        location: "West Yard",
        hourly_rate: 680,
        image_url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop"
      }
      ];

      const foundProduct = constructionEquipment.find(p => p.id === parseInt(productId));
      setProduct(foundProduct);
    };
    
    loadProduct();
  }, [productId]);

  // Calculate hours from date range
  useEffect(() => {
    if (rentalType === 'dateRange' && startDate && endDate && startTime && endTime) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      const diffMs = end - start;
      const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));
      setCalculatedHours(diffHours);
      if (product) {
        setTotalPrice(diffHours * product.hourly_rate);
      }
    }
  }, [startDate, endDate, startTime, endTime, rentalType, product]);

  // Calculate end date from hours
  useEffect(() => {
    if (rentalType === 'hours' && startDate && startTime && totalHours && product) {
      const start = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(start.getTime() + (parseFloat(totalHours) * 60 * 60 * 1000));
      const endDateStr = endDateTime.toISOString().split('T')[0];
      const endTimeStr = endDateTime.toTimeString().slice(0, 5);
      setCalculatedEndDate(`${endDateStr} at ${endTimeStr}`);
      setTotalPrice(parseFloat(totalHours) * product.hourly_rate);
    }
  }, [startDate, startTime, totalHours, rentalType, product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Navigate to payment page with booking data
    const bookingData = {
      product,
      rentalType,
      startDate,
      endDate,
      totalHours: rentalType === 'dateRange' ? calculatedHours : totalHours,
      totalPrice,
      customerInfo,
      paymentMethod
    };
    
    setTimeout(() => {
      navigate('/payment', { state: bookingData });
    }, 1000);
  };

  if (!product) {
    return (
      <div className="booking-container">
        <div className="booking-error">
          <h2>Equipment Not Found</h2>
          <p>The requested equipment could not be found.</p>
          <button onClick={() => navigate('/products')} className="back-btn">
            Back to Equipment Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-header">
        <button onClick={() => navigate('/products')} className="back-btn">
          ← Back to Catalog
        </button>
        <h1>Book Equipment</h1>
      </div>

      <div className="booking-content">
        <div className="equipment-summary">
          <div className="equipment-image">
            <img 
              src={product.image_url} 
              alt={product.name}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('Booking page - Image failed to load:', e.target.src);
                e.target.src = 'https://via.placeholder.com/400x300/cccccc/666666?text=Equipment+Image';
              }}
              onLoad={() => console.log('Booking page - Image loaded successfully:', product.name)}
            />
            <div className="equipment-type">{product.category}</div>
          </div>
          <div className="equipment-details">
            <h2>{product.name}</h2>
            <p className="description">{product.description}</p>
            <div className="availability-info">
              <div className="info-row">
                <span className="label">Available Units:</span>
                <span className="value">{product.available}</span>
              </div>
              <div className="info-row">
                <span className="label">Location:</span>
                <span className="value">{product.location}</span>
              </div>
              <div className="info-row">
                <span className="label">SKU:</span>
                <span className="value">{product.sku}</span>
              </div>
              <div className="info-row">
                <span className="label">Hourly Rate:</span>
                <span className="value">${product.hourly_rate}/hour</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-section">
            <h3>Rental Options</h3>
            <div className="rental-type-selector">
              <label className="radio-option">
                <input
                  type="radio"
                  value="dateRange"
                  checked={rentalType === 'dateRange'}
                  onChange={(e) => setRentalType(e.target.value)}
                />
                <span>Select Start & End Date/Time</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="hours"
                  checked={rentalType === 'hours'}
                  onChange={(e) => setRentalType(e.target.value)}
                />
                <span>Specify Total Hours</span>
              </label>
            </div>
          </div>

          {rentalType === 'dateRange' ? (
            <div className="form-section">
              <h3>Rental Period</h3>
              <div className="date-time-inputs">
                <div className="input-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="endTime">End Time</label>
                  <input
                    type="time"
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              {calculatedHours > 0 && (
                <div className="calculation-display">
                  <div className="calc-row">
                    <span>Total Hours:</span>
                    <span>{calculatedHours.toFixed(1)} hours</span>
                  </div>
                  <div className="calc-row total">
                    <span>Total Price:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="form-section">
              <h3>Rental Duration</h3>
              <div className="hours-inputs">
                <div className="input-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="totalHours">Total Hours</label>
                  <input
                    type="number"
                    id="totalHours"
                    value={totalHours}
                    onChange={(e) => setTotalHours(e.target.value)}
                    min="1"
                    step="0.5"
                    placeholder="e.g., 8 or 24.5"
                    required
                  />
                </div>
              </div>
              {calculatedEndDate && totalPrice > 0 && (
                <div className="calculation-display">
                  <div className="calc-row">
                    <span>Return Date & Time:</span>
                    <span>{calculatedEndDate}</span>
                  </div>
                  <div className="calc-row total">
                    <span>Total Price:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}


          <div className="form-section">
            <h3>Customer Information</h3>
            <div className="customer-inputs">
              <div className="input-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={customerInfo.company}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input-group">
                <label htmlFor="address">Project Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter the project address where equipment will be used"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Payment Method</h3>
            <div className="payment-methods">
              <div className="payment-grid">
                <div className="payment-option">
                  <input type="radio" id="orange_money" name="paymentMethod" value="orange_money" checked={paymentMethod === 'orange_money'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <label htmlFor="orange_money" className="payment-card orange-money">
                    <div className="payment-logo">🟠</div>
                    <div className="payment-info">
                      <h4>Orange Money</h4>
                      <p>Mobile money payment</p>
                    </div>
                  </label>
                </div>
                
                <div className="payment-option">
                  <input type="radio" id="afrimoney" name="paymentMethod" value="afrimoney" checked={paymentMethod === 'afrimoney'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <label htmlFor="afrimoney" className="payment-card afrimoney">
                    <div className="payment-logo">💜</div>
                    <div className="payment-info">
                      <h4>AfriMoney</h4>
                      <p>Digital wallet</p>
                    </div>
                  </label>
                </div>
                
                <div className="payment-option">
                  <input type="radio" id="vult" name="paymentMethod" value="vult" checked={paymentMethod === 'vult'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <label htmlFor="vult" className="payment-card vult">
                    <div className="payment-logo">⚡</div>
                    <div className="payment-info">
                      <h4>Vult</h4>
                      <p>Modern payments</p>
                    </div>
                  </label>
                </div>
                
                <div className="payment-option">
                  <input type="radio" id="bank_transfer" name="paymentMethod" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <label htmlFor="bank_transfer" className="payment-card bank-transfer">
                    <div className="payment-logo">🏦</div>
                    <div className="payment-info">
                      <h4>Bank Transfer</h4>
                      <p>Direct bank payment</p>
                    </div>
                  </label>
                </div>
                
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/products')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading || totalPrice === 0} className="submit-btn">
              {loading ? 'Submitting...' : `Submit Booking Request - $${totalPrice.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;
