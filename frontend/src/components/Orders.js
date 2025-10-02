import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { formatCurrency, getDisplayAmount } from '../utils/currency';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [dateFilter, setDateFilter] = useState('');

  // Initialize orders on component mount and listen for updates
  useEffect(() => {
    fetchOrders();
    
    // Listen for storage changes from customer portal
    const handleStorageChange = (e) => {
      if (e.key === 'demoOrders' || e.type === 'orderUpdated') {
        console.log('🔔 Order update detected, refreshing...');
        fetchOrders();
      }
    };

    // Listen for custom events from customer portal
    const handleOrderUpdate = () => {
      console.log('🔔 Custom order update event received, refreshing...');
      fetchOrders();
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('orderUpdated', handleOrderUpdate);
    
    // REMOVED: Auto-polling that was causing constant refresh
    // const pollInterval = setInterval(() => {
    //   console.log('🔄 Polling for order updates...');
    //   fetchOrders();
    // }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('orderUpdated', handleOrderUpdate);
      // clearInterval(pollInterval); // No longer needed
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    console.log('🔄 Fetching orders...');
    
    try {
      let allOrders = [];

      // PRIORITY 1: Try to fetch orders from backend
      try {
        const isProduction = window.location.hostname.includes('onrender.com');
        const apiUrl = isProduction 
          ? 'https://rslaf-backend.onrender.com/orders/public/all'  // Public endpoint (no auth)
          : 'http://localhost:3001/api/orders';                      // Local shared API
        
        console.log('🔄 Fetching orders from:', apiUrl);
        const sharedApiResponse = await fetch(apiUrl);
        
        if (sharedApiResponse.ok) {
          const sharedData = await sharedApiResponse.json();
          allOrders = Array.isArray(sharedData) ? sharedData : (sharedData.data || []);
          // Normalize shape to ensure UI fields exist
          allOrders = allOrders.map((o) => {
            const customer_info = o.customer_info || {
              name: o.customer_name || o.customer?.name || '',
              email: o.customer_email || o.customer?.email || '',
              phone: o.customer_phone || o.customer?.phone || ''
            };
            return {
              ...o,
              customer_info,
              equipment_name: o.equipment_name || o.product?.name || o.item_name || '',
              total_price: typeof o.total_price === 'number' ? o.total_price : (o.total ?? 0),
            };
          });
          console.log('✅ Orders fetched from API:', allOrders.length);
          console.log('📊 Orders data (normalized):', allOrders);
        } else {
          console.error('❌ API returned error:', sharedApiResponse.status);
        }
      } catch (sharedApiError) {
        console.error('⚠️ API fetch error:', sharedApiError);
        
        // PRIORITY 2: Try main API
        try {
          const response = await api.getOrders();
          let apiOrders = response.data || [];
          console.log('📡 Main API orders fetched:', apiOrders.length);
          allOrders = [...allOrders, ...apiOrders];
        } catch (apiError) {
          console.log('⚠️ Main API not available');
        }
      }

      // PRIORITY 3: Get demo orders from localStorage as fallback
      const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
      console.log('💾 Demo orders from localStorage:', demoOrders.length);

      // Combine all orders (shared API should already include everything)
      if (allOrders.length === 0) {
        allOrders = [...demoOrders];
      }
      
      console.log('📊 Total orders to display:', allOrders.length);
      // Final normalization pass (covers localStorage/demo shapes)
      const normalized = (allOrders || []).map((o) => {
        const customer_info = o.customer_info || {
          name: o.customer_name || o.customer?.name || '',
          email: o.customer_email || o.customer?.email || '',
          phone: o.customer_phone || o.customer?.phone || ''
        };
        return {
          ...o,
          customer_info,
          equipment_name: o.equipment_name || o.product?.name || o.item_name || '',
          total_price: typeof o.total_price === 'number' ? o.total_price : (o.total ?? 0),
          status: (o.status || '').toString()
        };
      });
      setOrders(normalized);

    } catch (error) {
      console.error('❌ Error in fetchOrders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
      console.log('✅ fetchOrders completed');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      paid: 'bg-green-100 text-green-800 border border-green-200',
      paid_awaiting_delivery: 'bg-green-100 text-green-800 border border-green-200',
      paid_awaiting_pickup: 'bg-green-100 text-green-800 border border-green-200',
      confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
      rented: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      'ready for delivery': 'bg-purple-100 text-purple-800 border border-purple-200',
      'picked up': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      returned: 'bg-gray-100 text-gray-800 border border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200'
    };

    const statusLabels = {
      paid_awaiting_delivery: 'Paid / Awaiting Delivery',
      paid_awaiting_pickup: 'Paid / Awaiting Pickup',
      rented: 'Rented (Active)',
    };

    const label = statusLabels[status.toLowerCase()] || (status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '));

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {label}
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

  const handleViewOrder = (order) => {
    alert(`Order Details:\n\nCustomer: ${order.customer_info?.name || order.customer?.name}\nEquipment: ${order.equipment_name || order.product?.name}\nAmount: $${order.total_price}\nStatus: ${order.status}\nOrder ID: ${order.id}`);
  };

  const handleEditOrder = (order) => {
    const newStatus = prompt(`Update status for ${order.customer_info?.name || order.customer?.name}:\n\nCurrent: ${order.status}\n\nEnter new status (pending, paid, confirmed, delivered):`, order.status);
    
    if (newStatus && newStatus !== order.status) {
      // Update order in the orders array
      const updatedOrders = orders.map(o => 
        o.id === order.id 
          ? { ...o, status: newStatus, updated_at: new Date().toISOString() }
          : o
      );
      setOrders(updatedOrders);
      
      // Update in localStorage
      const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
      const updatedDemoOrders = demoOrders.map(o => 
        o.id === order.id 
          ? { ...o, status: newStatus, updated_at: new Date().toISOString() }
          : o
      );
      localStorage.setItem('demoOrders', JSON.stringify(updatedDemoOrders));
      
      console.log(`✅ Order ${order.id} status updated to: ${newStatus}`);
    }
  };

  const handleDeleteOrder = (order) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this order?\n\nCustomer: ${order.customer_info?.name || order.customer?.name}\nEquipment: ${order.equipment_name || order.product?.name}\nAmount: $${order.total_price}`);
    
    if (!confirmDelete) return;

    const isProduction = window.location.hostname.includes('onrender.com');
    const deleteFromState = () => {
      const updatedOrders = orders.filter(o => o.id !== order.id);
      setOrders(updatedOrders);
      const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
      const updatedDemoOrders = demoOrders.filter(o => o.id !== order.id);
      localStorage.setItem('demoOrders', JSON.stringify(updatedDemoOrders));
      // Also remove from shared orders cache used by Dashboard
      const sharedOrders = JSON.parse(localStorage.getItem('rslaf_shared_orders') || '[]');
      const updatedShared = sharedOrders.filter(o => o.id !== order.id);
      localStorage.setItem('rslaf_shared_orders', JSON.stringify(updatedShared));
      window.dispatchEvent(new Event('orderUpdated'));
      console.log(`🗑️ Order ${order.id} deleted`);
    };

    if (isProduction) {
      fetch(`https://rslaf-backend.onrender.com/orders/public/${order.id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error('Delete failed');
          deleteFromState();
        })
        .catch(err => {
          console.error('❌ Failed to delete on server, removing locally as fallback', err);
          deleteFromState();
        });
    } else {
      deleteFromState();
    }
  };

  const clearAllOrders = () => {
    const confirmClear = window.confirm('Are you sure you want to clear all orders? This will remove all orders from the database (demo) and local storage.');
    if (!confirmClear) return;

    const isProduction = window.location.hostname.includes('onrender.com');
    const clearLocal = () => {
      localStorage.removeItem('demoOrders');
      localStorage.removeItem('rslaf_shared_orders');
      setOrders([]);
      window.dispatchEvent(new Event('orderUpdated'));
      console.log('🧹 All orders cleared locally');
    };

    if (isProduction) {
      fetch('https://rslaf-backend.onrender.com/orders/public/all', { method: 'DELETE' })
        .then(async res => {
          if (res.ok) {
            clearLocal();
            return;
          }
          // If 404, fall back to per-order deletion
          if (res.status === 404) {
            try {
              const listRes = await fetch('https://rslaf-backend.onrender.com/orders/public/all');
              const data = listRes.ok ? await listRes.json() : [];
              const ids = Array.isArray(data) ? data.map(o => o.id) : [];
              for (const id of ids) {
                try { await fetch(`https://rslaf-backend.onrender.com/orders/public/${id}`, { method: 'DELETE' }); } catch {}
              }
            } catch {}
            clearLocal();
            return;
          }
          throw new Error('Server clear failed');
        })
        .catch(err => {
          console.error('❌ Failed to clear on server, clearing locally as fallback', err);
          clearLocal();
        });
    } else {
      clearLocal();
    }
  };

  const addManualOrder = () => {
    const customerName = prompt("Enter customer name:", "");
    const equipmentName = prompt("Enter equipment name:", "");
    const totalPrice = parseFloat(prompt("Enter total price:", "0"));
    const totalHours = parseInt(prompt("Enter total hours:", "8"));
    
    if (!customerName || !equipmentName || !totalPrice) {
      alert("Please fill in all required fields");
      return;
    }

    const manualOrder = {
      id: Date.now(),
      customer_info: {
        name: customerName,
        email: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
        phone: '+232 78 999888',
        company: `${customerName} Company`,
        address: 'Freetown, Sierra Leone'
      },
      equipment_name: equipmentName,
      product: { name: equipmentName },
      status: 'paid',
      delivery_status: 'ready for delivery',
      payment_status: 'completed',
      payment_method: 'credit_debit_card',
      total_price: totalPrice,
      total_hours: totalHours,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    const currentOrders = [...orders];
    currentOrders.push(manualOrder);
    setOrders(currentOrders);
    
    // Also store in localStorage
    const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
    demoOrders.push(manualOrder);
    localStorage.setItem('demoOrders', JSON.stringify(demoOrders));
    
    // Trigger dashboard update
    window.dispatchEvent(new Event('orderUpdated'));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'demoOrders',
      newValue: JSON.stringify(demoOrders),
      url: window.location.href
    }));
    
    console.log('✅ Manual order added:', manualOrder);
    alert(`Order added successfully for ${customerName}!`);
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
  
  console.log('🔍 Total orders:', orders.length);
  console.log('🔍 Filtered orders:', filteredOrders.length);
  console.log('🔍 Search term:', searchTerm);
  console.log('🔍 Status filter:', statusFilter);
  console.log('🔍 Date filter:', dateFilter);

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
                        {order.is_late_delivery && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            ⚠️ Late Delivery
                          </span>
                        )}
                        {order.is_late_return && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                            ⏰ Late Return ({order.extra_billing_hours?.toFixed(1)}h extra)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(getDisplayAmount(order.total_price || order.total_amount || 0, true))}
                        </span>
                        <div className="text-sm text-gray-500">
                          {order.payment_method ? (
                            <span className="font-medium">
                              {order.payment_method === 'orange_money' ? '🟠 Orange Money' :
                               order.payment_method === 'afri_money' ? '💜 Afri Money' :
                               order.payment_method.replace('_', ' ').toUpperCase()}
                            </span>
                          ) : (
                            'Payment pending'
                          )}
                        </div>
                        {order.payment_details?.transactionId && (
                          <div className="text-xs text-gray-400 mt-1">
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                              TXN: {order.payment_details.transactionId.substring(0, 12)}...
                            </span>
                          </div>
                        )}
                        {order.payment_status && (
                          <div className="mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              order.payment_status === 'completed' ? 'bg-green-100 text-green-700' :
                              order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {order.payment_status === 'completed' ? '✓ Paid' : 
                               order.payment_status === 'pending' ? '⏳ Pending' : 
                               order.payment_status}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className="p-1 text-blue-400 hover:text-blue-600"
                          title="View Order"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleEditOrder(order)}
                          className="p-1 text-green-400 hover:text-green-600"
                          title="Edit Order"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order)}
                          className="p-1 text-red-400 hover:text-red-600"
                          title="Delete Order"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
