import React, { useState, useEffect } from 'react';
import { getProducts, getOrders, getCustomers } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRentals: 0,
    activeRentals: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Listen for order updates to refresh dashboard
    const handleOrderUpdate = () => {
      console.log('🔔 Dashboard - Order update detected, refreshing stats...');
      loadDashboardData();
    };

    // Listen for inventory updates to refresh dashboard
    const handleInventoryUpdate = (e) => {
      if (e.key === 'products' || e.type === 'inventoryUpdated') {
        console.log('🔔 Dashboard - Inventory update detected, refreshing stats...');
        loadDashboardData();
      }
    };

    // Add event listeners for order and inventory updates
    window.addEventListener('storage', handleOrderUpdate);
    window.addEventListener('storage', handleInventoryUpdate);
    window.addEventListener('orderUpdated', handleOrderUpdate);
    window.addEventListener('inventoryUpdated', handleInventoryUpdate);

    return () => {
      window.removeEventListener('storage', handleOrderUpdate);
      window.removeEventListener('storage', handleInventoryUpdate);
      window.removeEventListener('orderUpdated', handleOrderUpdate);
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get orders from multiple sources like the Orders component does
      let allOrders = [];

      try {
        const response = await getOrders();
        let apiOrders = response.data || [];
        allOrders = [...allOrders, ...apiOrders];
      } catch (apiError) {
        console.log('⚠️ API not available for dashboard');
      }

      // Get demo orders from localStorage (for manually added orders)
      const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
      console.log('💾 Dashboard - Demo orders from localStorage:', demoOrders.length);

      // ALSO check shared orders from customer portal
      const sharedOrders = JSON.parse(localStorage.getItem('rslaf_shared_orders') || '[]');
      console.log('🔗 Dashboard - Shared orders from customer portal:', sharedOrders.length);

      // Combine all real orders (same as Orders component)
      allOrders = [...allOrders, ...demoOrders, ...sharedOrders];
      console.log('📊 Dashboard - Total orders to analyze:', allOrders.length);

      // Extract unique customers from orders
      const uniqueCustomers = new Set();
      allOrders.forEach(order => {
        const customerName = order.customer_info?.name || order.customer?.name || order.customer_id;
        if (customerName) {
          uniqueCustomers.add(customerName);
        }
      });

      // Calculate real stats from actual order data
      const activeRentals = allOrders.filter(order => 
        order.status === 'confirmed' || order.status === 'pending' || order.status === 'paid'
      ).length;
      
      const totalRevenue = allOrders.reduce((sum, order) => 
        sum + (parseFloat(order.total_price) || parseFloat(order.total_amount) || 0), 0
      );

      // Get products from inventory (real count)
      let totalProducts = 0;
      try {
        const productsRes = await getProducts();
        totalProducts = productsRes.data?.length || 0;
        console.log('📦 Dashboard - Products from API:', totalProducts);
      } catch (error) {
        console.log('⚠️ Products API not available, checking localStorage...');
        
        // Check if there are any products stored locally
        const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
        totalProducts = localProducts.length;
        console.log('📦 Dashboard - Products from localStorage:', totalProducts);
      }

      setStats({
        totalRentals: allOrders.length,
        activeRentals,
        totalRevenue,
        totalProducts,
        totalCustomers: uniqueCustomers.size
      });

      setRecentOrders(allOrders.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Keep zero stats on error
      setStats({
        totalRentals: 0,
        activeRentals: 0,
        totalRevenue: 0,
        totalProducts: 0, // Real zero count
        totalCustomers: 0
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your rental management system</p>
        </div>
        <Link 
          to="/orders/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
        >
          + New Rental
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rentals</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRentals}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rentals</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeRentals}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/orders" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Manage Rentals</h3>
              <p className="text-sm text-gray-600">View and manage all rental orders</p>
            </div>
          </Link>

          <Link to="/products" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Product Catalog</h3>
              <p className="text-sm text-gray-600">Add and manage rental products</p>
            </div>
          </Link>

          <Link to="/customers" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Customer Management</h3>
              <p className="text-sm text-gray-600">Manage customer information</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Rentals</h2>
          <Link to="/orders" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View all →
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">No rental orders yet</p>
            <Link to="/orders/new" className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block">
              Create your first rental →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link to={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                        #{order.id}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {order.customer_info?.name || order.customer?.name || order.customer_id || 'Unknown Customer'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-medium">${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(order.created_at || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
