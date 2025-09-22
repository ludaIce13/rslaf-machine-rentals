import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [dateFilter, setDateFilter] = useState('');

  // Initialize orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    console.log('🔄 Fetching orders...');
    
    try {
      // First, always create sample orders for immediate display
      const sampleOrders = [
        {
          id: 1,
          customer_info: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+232 78 123456',
            company: 'ABC Construction',
            address: '23 Kissy Road, Freetown'
          },
          equipment_name: 'CAT Excavator',
          product: { name: 'CAT Excavator' },
          status: 'pending',
          delivery_status: 'pending',
          payment_status: 'pending',
          payment_method: 'orange_money',
          total_price: 150.00,
          total_hours: 8,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          customer_info: {
            name: 'Mary Johnson',
            email: 'mary.johnson@construction.com',
            phone: '+232 79 654321',
            company: 'Johnson Builders',
            address: '45 Wilkinson Road, Freetown'
          },
          equipment_name: 'Dump Truck',
          product: { name: 'Dump Truck' },
          status: 'paid',
          delivery_status: 'ready for delivery',
          payment_status: 'completed',
          payment_method: 'bank_transfer',
          total_price: 200.00,
          total_hours: 12,
          start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          customer_info: {
            name: 'Ahmed Conteh',
            email: 'ahmed.conteh@builders.sl',
            phone: '+232 76 555123',
            company: 'Conteh Construction',
            address: '12 Lumley Beach Road, Freetown'
          },
          equipment_name: 'Wheel Loader',
          product: { name: 'Wheel Loader' },
          status: 'confirmed',
          delivery_status: 'out for delivery',
          payment_status: 'completed',
          payment_method: 'afrimoney',
          total_price: 300.00,
          total_hours: 16,
          start_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      console.log('✅ Sample orders created:', sampleOrders.length);
      
      try {
        const response = await api.getOrders();
        let apiOrders = response.data || [];
        console.log('📡 API orders fetched:', apiOrders.length);

        // Also get demo orders from localStorage
        const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
        console.log('💾 Demo orders from localStorage:', demoOrders.length);

        // Combine all orders: sample + API + demo
        const allOrders = [...sampleOrders, ...apiOrders, ...demoOrders];
        console.log('📊 Total orders to display:', allOrders.length);
        
        setOrders(allOrders);
        
      } catch (apiError) {
        console.log('⚠️ API not available, using sample + demo orders only');
        
        // Get demo orders from localStorage
        const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
        console.log('💾 Demo orders from localStorage:', demoOrders.length);
        
        // Combine sample + demo orders
        const allOrders = [...sampleOrders, ...demoOrders];
        console.log('📊 Total orders to display (no API):', allOrders.length);
        
        setOrders(allOrders);
      }

    } catch (error) {
      console.error('❌ Error in fetchOrders:', error);
      
      // Fallback: just show sample orders
      const fallbackOrders = [
        {
          id: 999,
          customer_info: {
            name: 'Fallback Customer',
            email: 'fallback@example.com',
            phone: '+232 78 000000',
            company: 'Fallback Company',
            address: 'Fallback Address, Freetown'
          },
          equipment_name: 'Fallback Equipment',
          product: { name: 'Fallback Equipment' },
          status: 'pending',
          delivery_status: 'pending',
          payment_status: 'pending',
          payment_method: 'orange_money',
          total_price: 100.00,
          total_hours: 8,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        }
      ];
      
      console.log('🆘 Using fallback orders:', fallbackOrders.length);
      setOrders(fallbackOrders);
      
    } finally {
      setLoading(false);
      console.log('✅ fetchOrders completed');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      paid: 'bg-green-100 text-green-800 border border-green-200',
      confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
      'ready for delivery': 'bg-purple-100 text-purple-800 border border-purple-200',
      'picked up': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      returned: 'bg-gray-100 text-gray-800 border border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDeliveryBadge = (deliveryStatus) => {
    if (!deliveryStatus) return null;
    
    const deliveryStyles = {
      'ready for delivery': 'bg-green-50 text-green-700 border border-green-200',
      'out for delivery': 'bg-blue-50 text-blue-700 border border-blue-200',
      'delivered': 'bg-purple-50 text-purple-700 border border-purple-200'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${deliveryStyles[deliveryStatus.toLowerCase()] || 'bg-gray-50 text-gray-700'}`}>
        📦 {deliveryStatus}
      </span>
    );
  };

  const clearDemoOrders = () => {
    localStorage.removeItem('demoOrders');
    console.log('🗑️ Demo orders cleared');
    fetchOrders();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm) ||
                         (order.customer_info?.name || order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customer_info?.email || order.customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.equipment_name || order.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || order.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesDate = !dateFilter || (order.start_date && new Date(order.start_date).toDateString() === new Date(dateFilter).toDateString());
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-600 mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearDemoOrders}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Demo
          </button>
          <button
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => navigate('/orders/new')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <span className="text-lg">+</span>
            New Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search orders..."
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
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Paid</option>
          <option>Confirmed</option>
          <option>Ready for delivery</option>
          <option>Picked up</option>
          <option>Returned</option>
          <option>Cancelled</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="mm/dd/yyyy"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ORDER ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CUSTOMER & EQUIPMENT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PERIOD & HOURS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS & DELIVERY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TOTAL & PAYMENT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        #SS{order.id.toString().padStart(4, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {order.customer_info?.name || order.customer?.name || 'Unknown Customer'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {order.product?.name || order.equipment_name || 'Equipment'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {order.customer_info?.email || order.customer?.email || ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900">
                          {order.start_date && order.end_date ? (
                            `${new Date(order.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(order.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                          ) : (
                            'No dates'
                          )}
                        </span>
                        <span className="text-sm text-gray-500">
                          {order.total_hours ? `${order.total_hours} hours` : 'Duration not set'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(order.status)}
                        {getDeliveryBadge(order.delivery_status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          ${order.total_price?.toFixed(2) || order.total_amount?.toFixed(2) || '0.00'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {order.payment_method ? order.payment_method.replace('_', ' ').toUpperCase() : 'Payment pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
