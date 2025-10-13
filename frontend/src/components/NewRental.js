import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { convertUSDToSLL, formatCurrency } from '../utils/currency';

const NewRental = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    productId: '',
    inventoryItemId: '',
    startDate: '',
    startTime: '08:00',
    endDate: '',
    endTime: '17:00',
    durationType: 'hours', // 'hours' or 'days'
    totalHours: 0,
    totalDays: 0,
    hourlyRate: 0,
    dailyRate: 0,
    totalAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    deliveryMethod: 'pickup',
    depositAmount: 0,
    notes: '',
    operatorRequired: false,
    insuranceRequired: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, productsRes, inventoryRes] = await Promise.all([
        api.getCustomers(),
        api.getProducts(),
        api.getInventory()
      ]);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
      setInventory(inventoryRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Calculate duration and total whenever dates/times change
  useEffect(() => {
    calculateTotal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, formData.startTime, formData.endDate, formData.endTime, formData.durationType, formData.hourlyRate, formData.dailyRate]);

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    setFormData(prev => ({
      ...prev,
      productId,
      inventoryItemId: '', // Reset inventory selection when product changes
      hourlyRate: product?.hourly_rate || 0,
      dailyRate: product?.daily_rate || 0
    }));
  };

  const calculateTotal = () => {
    if (!formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) {
      return;
    }

    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (end <= start) return;

    const diffMs = end - start;
    const hours = diffMs / (1000 * 60 * 60);
    const days = hours / 24;

    let total = 0;
    if (formData.durationType === 'hours' && formData.hourlyRate > 0) {
      total = hours * formData.hourlyRate;
    } else if (formData.durationType === 'days' && formData.dailyRate > 0) {
      total = Math.ceil(days) * formData.dailyRate;
    }

    setFormData(prev => ({
      ...prev,
      totalHours: parseFloat(hours.toFixed(2)),
      totalDays: parseFloat(days.toFixed(2)),
      totalAmount: parseFloat(total.toFixed(2))
    }));
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    setFormData(prev => ({
      ...prev,
      customerId,
      customerName: customer?.name || '',
      customerEmail: customer?.email || '',
      customerPhone: customer?.phone || ''
    }));
  };

  const getAvailableInventory = () => {
    if (!formData.productId) return [];
    return inventory.filter(item => 
      item.product_id === parseInt(formData.productId) && item.active
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.totalAmount === 0) {
      alert('Please complete all date and time fields to calculate the total amount.');
      return;
    }

    setLoading(true);

    try {
      // Create comprehensive order
      const orderData = {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
        equipment_name: products.find(p => p.id === parseInt(formData.productId))?.name || 'Equipment',
        total_price: formData.totalAmount,
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentStatus,
        start_date: `${formData.startDate}T${formData.startTime}:00`,
        end_date: `${formData.endDate}T${formData.endTime}:00`,
        total_hours: formData.totalHours,
        delivery_method: formData.deliveryMethod,
        status: formData.paymentStatus === 'paid' ? 'paid_awaiting_delivery' : 'pending_payment',
        notes: formData.notes,
        deposit_amount: formData.depositAmount,
        operator_required: formData.operatorRequired,
        insurance_required: formData.insuranceRequired
      };

      // Use the public create-simple endpoint
      const isProduction = window.location.hostname.includes('onrender.com');
      const baseUrl = isProduction
        ? 'https://rslaf-backend.onrender.com'
        : 'http://localhost:3001/api';
      
      const response = await fetch(`${baseUrl}/orders/public/create-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      alert('✅ Rental order created successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error creating rental:', error);
      alert('❌ Failed to create rental. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">New Rental Order</h1>
          <p className="text-gray-600">Create rental order for walk-in customers or phone bookings</p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Orders
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Customer Information</h3>
            
            {/* Customer Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Existing Customer
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">New Customer (Enter details below)</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  required
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  required
                  placeholder="+232 XX XXX XXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Equipment Selection Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏗️ Equipment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Type *
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select equipment type</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.hourly_rate || product.daily_rate}/hr
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Type *
                </label>
                <select
                  value={formData.durationType}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="hours">Hourly Rate</option>
                  <option value="days">Daily Rate</option>
                </select>
              </div>
            </div>

            {formData.productId && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium text-blue-900">Selected Rate: </span>
                  <span className="text-blue-700">
                    ${formData.durationType === 'hours' ? formData.hourlyRate : formData.dailyRate} per {formData.durationType === 'hours' ? 'hour' : 'day'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Rental Duration Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Rental Duration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Duration Summary */}
            {formData.totalAmount > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Hours:</span>
                    <p className="font-semibold text-gray-900">{formData.totalHours} hrs</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Days:</span>
                    <p className="font-semibold text-gray-900">{formData.totalDays} days</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount (USD):</span>
                    <p className="font-semibold text-green-700">${formData.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="col-span-3 border-t border-green-300 pt-2 mt-2">
                    <span className="text-gray-600">Amount (SLL):</span>
                    <p className="font-semibold text-green-700 text-lg">{formatCurrency(convertUSDToSLL(formData.totalAmount))}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment & Delivery Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Payment & Delivery</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="cash">💵 Cash</option>
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                  <option value="orange_money">🟠 Orange Money</option>
                  <option value="afri_money">💜 Afri Money</option>
                  <option value="credit_card">💳 Credit/Debit Card</option>
                  <option value="check">📝 Check</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status *
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="pending">⏳ Pending Payment</option>
                  <option value="partial">💰 Partial Payment</option>
                  <option value="paid">✅ Fully Paid</option>
                  <option value="deposit">🏦 Deposit Received</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Method *
                </label>
                <select
                  value={formData.deliveryMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryMethod: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="pickup">🏢 Customer Pickup</option>
                  <option value="delivery">🚚 Delivery to Site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="mt-4 space-y-3">
              <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.operatorRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, operatorRequired: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  👷 Operator Required (with equipment)
                </span>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.insuranceRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, insuranceRequired: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  🛡️ Insurance Coverage Required
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Any special instructions, delivery address, or additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {formData.totalAmount > 0 ? (
                <span className="text-green-700 font-semibold">
                  ✓ Total: ${formData.totalAmount.toFixed(2)} ({formatCurrency(convertUSDToSLL(formData.totalAmount))})
                </span>
              ) : (
                <span className="text-orange-600">
                  ⚠️ Complete dates/times to see total
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || formData.totalAmount === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Rental Order
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRental;
