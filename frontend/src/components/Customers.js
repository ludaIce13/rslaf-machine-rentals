import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Pull public orders first (no auth)
      let allOrders = [];
      try {
        const isProduction = window.location.hostname.includes('onrender.com');
        const url = isProduction
          ? 'https://rslaf-backend.onrender.com/orders/public/all'
          : 'http://localhost:3001/api/orders';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          allOrders = Array.isArray(data) ? data : (data.data || []);
        }
      } catch (e) {
        console.log('⚠️ Public orders fetch failed', e);
      }

      // Fallback: protected API
      if (allOrders.length === 0) {
        try {
          const response = await api.getOrders();
          let apiOrders = response.data || [];
          allOrders = [...allOrders, ...apiOrders];
        } catch (apiError) {
          console.log('⚠️ API not available for customers');
        }
      }

      // Local fallbacks
      const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
      const sharedOrders = JSON.parse(localStorage.getItem('rslaf_shared_orders') || '[]');
      allOrders = allOrders.length ? allOrders : [...demoOrders, ...sharedOrders];
      console.log('📊 Customers - Total orders to analyze:', allOrders.length);

      // Extract unique customers from orders
      const customersMap = new Map();
      allOrders.forEach(order => {
        const customerInfo = order.customer_info || order.customer || {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone,
        };
        const customerName = customerInfo.name || order.customer_id;
        const customerEmail = customerInfo.email || `${customerName?.toLowerCase().replace(' ', '.')}@example.com`;
        const customerPhone = customerInfo.phone || '+232 78 000000';
        
        if (customerName) {
          if (!customersMap.has(customerName)) {
            customersMap.set(customerName, {
              id: customerName.toLowerCase().replace(' ', '_'),
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
              company: customerInfo.company || `${customerName} Company`,
              address: customerInfo.address || 'Freetown, Sierra Leone',
              customerSince: new Date(order.created_at || Date.now()).toLocaleDateString(),
              lastRental: new Date(order.created_at || Date.now()).toLocaleDateString(),
              totalOrders: 0,
              totalSpent: 0,
              rentalHistory: []
            });
          }
          
          const customer = customersMap.get(customerName);
          customer.totalOrders += 1;
          customer.totalSpent += parseFloat(order.total_price || order.total_amount || 0);
          customer.rentalHistory.push({
            id: `#${order.id}`,
            product: order.equipment_name || order.product?.name || 'Equipment',
            dates: `${new Date(order.start_date || order.created_at).toLocaleDateString()} - ${new Date(order.end_date || order.created_at).toLocaleDateString()}`,
            status: order.status || 'completed',
            amount: parseFloat(order.total_price || order.total_amount || 0)
          });
        }
      });

      const customersArray = Array.from(customersMap.values());
      console.log('👥 Extracted customers:', customersArray.length);
      setCustomers(customersArray);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createCustomer(newCustomer);
      setNewCustomer({ name: '', email: '', phone: '' });
      setShowAddModal(false);
      fetchCustomers(); // Refresh the list
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayCustomers = customers;

  const filteredCustomers = displayCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Content */}
      <div className="flex gap-8">
        {/* Customer List */}
        <div className="w-3/5 pr-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <span className="text-lg">+</span>
              Add Customer
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Filter</button>
          </div>

          {/* Customer List */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-6 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <span className="col-span-6">Name</span>
                <span className="col-span-3">Contact</span>
                <span className="col-span-2">Last Rental</span>
                <span className="col-span-1"></span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`px-5 py-5 cursor-pointer hover:bg-gray-50 ${selectedCustomer?.id === customer.id ? 'bg-gray-50' : ''}`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="grid grid-cols-12 gap-6 items-center min-h-[64px]">
                    <div className="flex items-center gap-4 col-span-6 min-w-0">
                      <img
                        src={customer.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                        alt={customer.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="leading-5 min-w-0">
                        <div className="text-gray-900 font-medium text-base truncate" title={customer.name}>{customer.name}</div>
                        <div className="text-gray-500 text-xs truncate whitespace-nowrap max-w-[320px]" title={customer.email}>{customer.email}</div>
                      </div>
                    </div>
                    <div className="text-gray-700 text-sm col-span-3">
                      <div className="font-medium text-gray-900 truncate" title={customer.phone}>{customer.phone}</div>
                    </div>
                    <div className="text-gray-700 text-sm col-span-2 text-gray-800">{customer.lastRental}</div>
                    <div className="flex justify-end col-span-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Details Sidebar */}
        <div className="w-2/5 pl-8 border-l border-gray-200">
          {selectedCustomer ? (
            <div>
              {/* Customer Profile */}
              <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-5 mb-5">
                  <img
                    src={selectedCustomer.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                    alt={selectedCustomer.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedCustomer.name}</h2>
                    <p className="text-gray-500 mt-0.5">Customer since {selectedCustomer.customerSince}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-red-600 rounded-lg hover:bg-red-700">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-4">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Details</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Rental History</button>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-900">{selectedCustomer.email}</span>
                      <span className="text-gray-500 text-sm">Email</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-900">{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.address && (
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-900">{selectedCustomer.address}</span>
                        <span className="text-gray-500 text-sm">Address</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rental History */}
              {selectedCustomer.rentalHistory && (
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Rental History ({selectedCustomer.rentalHistory.length})</h3>
                  <div className="space-y-4">
                    {selectedCustomer.rentalHistory.map((rental, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <div className="text-gray-900 font-medium">{rental.product}</div>
                          <div className="text-gray-500 text-sm">{rental.id}</div>
                          <div className="text-gray-500 text-sm">Rented: {rental.dates}</div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {rental.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Select a customer to view details
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Customer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
