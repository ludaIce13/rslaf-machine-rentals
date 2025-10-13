import React, { useState, useEffect } from 'react';
import { formatCurrency, getDisplayAmount } from '../utils/currency';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Get all orders from localStorage
      const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
      const sharedOrders = JSON.parse(localStorage.getItem('rslaf_shared_orders') || '[]');
      const allOrders = [...demoOrders, ...sharedOrders];

      // Filter orders by date range
      const filteredOrders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at || order.start_date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59);
        return orderDate >= startDate && orderDate <= endDate;
      });

      // Calculate analytics
      const analytics = calculateAnalytics(filteredOrders);
      setReportData(analytics);
      
      console.log('📊 Report generated:', analytics);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (orders) => {
    // Revenue metrics
    const totalRevenue = orders.reduce((sum, order) => 
      sum + (order.total_price || order.total_amount || 0), 0);
    
    const paidOrders = orders.filter(o => 
      o.payment_status === 'completed' || o.status === 'paid' || o.status?.includes('paid'));
    const paidRevenue = paidOrders.reduce((sum, order) => 
      sum + (order.total_price || order.total_amount || 0), 0);
    
    const pendingRevenue = totalRevenue - paidRevenue;

    // Order status breakdown
    const statusCounts = {};
    orders.forEach(order => {
      const status = order.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Payment method breakdown
    const paymentMethods = {};
    orders.forEach(order => {
      if (order.payment_method) {
        const method = order.payment_method;
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
      }
    });

    // Equipment analytics
    const equipmentUsage = {};
    orders.forEach(order => {
      const equipment = order.product?.name || order.equipment_name || 'Unknown';
      if (!equipmentUsage[equipment]) {
        equipmentUsage[equipment] = { count: 0, revenue: 0 };
      }
      equipmentUsage[equipment].count += 1;
      equipmentUsage[equipment].revenue += (order.total_price || order.total_amount || 0);
    });

    // Customer analytics
    const uniqueCustomers = new Set();
    orders.forEach(order => {
      const customer = order.customer_info?.email || order.customer?.email || order.customer_id;
      if (customer) uniqueCustomers.add(customer);
    });

    // Time-based analytics
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    return {
      overview: {
        totalOrders: orders.length,
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        averageOrderValue,
        uniqueCustomers: uniqueCustomers.size
      },
      statusBreakdown: statusCounts,
      paymentMethods,
      equipmentUsage,
      orders: orders.sort((a, b) => 
        new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date))
    };
  };

  const exportToCSV = () => {
    if (!reportData || !reportData.orders) return;
    
    const headers = ['Order ID', 'Date', 'Customer', 'Equipment', 'Status', 'Payment Method', 'Amount (USD)', 'Amount (SLL)'];
    const rows = reportData.orders.map(order => [
      `#SS${(order.id || '').toString().padStart(4, '0')}`,
      new Date(order.created_at || order.start_date).toLocaleDateString(),
      order.customer_info?.name || order.customer?.name || 'Unknown',
      order.product?.name || order.equipment_name || 'Equipment',
      order.status || 'N/A',
      order.payment_method || 'N/A',
      (order.total_price || order.total_amount || 0).toFixed(2),
      (convertUSDToSLL(order.total_price || order.total_amount || 0)).toFixed(0)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RSLAF_Report_${dateRange.start}_to_${dateRange.end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const convertUSDToSLL = (usd) => {
    return usd * 24; // Simplified exchange rate
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'revenue', label: '💰 Revenue', icon: '💰' },
    { id: 'equipment', label: '🏗️ Equipment', icon: '🏗️' },
    { id: 'customers', label: '👥 Customers', icon: '👥' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Business Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your rental operations</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={!reportData || reportData.orders.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading && !reportData && (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Generating report...</p>
        </div>
      )}

      {!loading && !reportData && (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-4 text-gray-600">Click "Generate Report" to view analytics</p>
        </div>
      )}

      {reportData && (
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-900 mt-2">
                        {formatCurrency(getDisplayAmount(reportData.overview.totalRevenue, true))}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        ${reportData.overview.totalRevenue.toFixed(2)} USD
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Total Orders</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">
                        {reportData.overview.totalOrders}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        in selected period
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Avg Order Value</p>
                      <p className="text-3xl font-bold text-purple-900 mt-2">
                        {formatCurrency(getDisplayAmount(reportData.overview.averageOrderValue, true))}
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        ${reportData.overview.averageOrderValue.toFixed(2)} USD
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-800">Paid Revenue</p>
                      <p className="text-3xl font-bold text-orange-900 mt-2">
                        {formatCurrency(getDisplayAmount(reportData.overview.paidRevenue, true))}
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        ${reportData.overview.paidRevenue.toFixed(2)} USD
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Pending Revenue</p>
                      <p className="text-3xl font-bold text-yellow-900 mt-2">
                        {formatCurrency(getDisplayAmount(reportData.overview.pendingRevenue, true))}
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        ${reportData.overview.pendingRevenue.toFixed(2)} USD
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⏳</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6 border border-pink-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-pink-800">Unique Customers</p>
                      <p className="text-3xl font-bold text-pink-900 mt-2">
                        {reportData.overview.uniqueCustomers}
                      </p>
                      <p className="text-xs text-pink-700 mt-1">
                        active customers
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(reportData.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-sm text-gray-600 capitalize">{status.replace(/_/g, ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods Used</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(reportData.paymentMethods).map(([method, count]) => (
                    <div key={method} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-sm text-gray-600">
                        {method === 'orange_money' ? '🟠 Orange Money' :
                         method === 'afri_money' ? '💜 Afri Money' :
                         method === 'bank_transfer' ? '🏦 Bank Transfer' :
                         method === 'cash' ? '💵 Cash' :
                         method.replace(/_/g, ' ').toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analysis</h3>
              
              <div className="space-y-6">
                {/* Revenue Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm font-medium text-green-800">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-900 mt-2">
                      {formatCurrency(getDisplayAmount(reportData.overview.totalRevenue, true))}
                    </p>
                    <p className="text-xs text-green-700 mt-1">${reportData.overview.totalRevenue.toFixed(2)} USD</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">Collected</p>
                    <p className="text-2xl font-bold text-blue-900 mt-2">
                      {formatCurrency(getDisplayAmount(reportData.overview.paidRevenue, true))}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {reportData.overview.totalRevenue > 0 
                        ? ((reportData.overview.paidRevenue / reportData.overview.totalRevenue) * 100).toFixed(1)
                        : 0}% collection rate
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-2">
                      {formatCurrency(getDisplayAmount(reportData.overview.pendingRevenue, true))}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      {reportData.overview.totalRevenue > 0 
                        ? ((reportData.overview.pendingRevenue / reportData.overview.totalRevenue) * 100).toFixed(1)
                        : 0}% pending
                    </p>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Recent Transactions</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (SLL)</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.orders.slice(0, 10).map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              #SS{order.id.toString().padStart(4, '0')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {order.customer_info?.name || order.customer?.name || 'Unknown'}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {formatCurrency(getDisplayAmount(order.total_price || order.total_amount || 0, true))}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.payment_status === 'completed' || order.status?.includes('paid')
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.payment_status === 'completed' || order.status?.includes('paid') ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(order.created_at || order.start_date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Performance</h3>
              
              <div className="space-y-4">
                {Object.entries(reportData.equipmentUsage)
                  .sort((a, b) => b[1].revenue - a[1].revenue)
                  .map(([equipment, data]) => (
                    <div key={equipment} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{equipment}</h4>
                        <span className="text-2xl">🏗️</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Bookings</p>
                          <p className="text-xl font-bold text-gray-900">{data.count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Revenue</p>
                          <p className="text-xl font-bold text-green-700">
                            {formatCurrency(getDisplayAmount(data.revenue, true))}
                          </p>
                          <p className="text-xs text-gray-500">${data.revenue.toFixed(2)} USD</p>
                        </div>
                      </div>
                    </div>
                  ))}
                {Object.keys(reportData.equipmentUsage).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No equipment data available</p>
                )}
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Total Customers</p>
                      <p className="text-4xl font-bold text-blue-900 mt-2">
                        {reportData.overview.uniqueCustomers}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-3xl">👥</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Avg Orders per Customer</p>
                      <p className="text-4xl font-bold text-purple-900 mt-2">
                        {reportData.overview.uniqueCustomers > 0 
                          ? (reportData.overview.totalOrders / reportData.overview.uniqueCustomers).toFixed(1)
                          : 0}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center">
                      <span className="text-3xl">📊</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Customer List</h4>
                <div className="space-y-2">
                  {Array.from(new Set(reportData.orders.map(o => 
                    JSON.stringify({
                      name: o.customer_info?.name || o.customer?.name || 'Unknown',
                      email: o.customer_info?.email || o.customer?.email || 'No email'
                    })
                  ))).map(customerStr => {
                    const customer = JSON.parse(customerStr);
                    const customerOrders = reportData.orders.filter(o => 
                      (o.customer_info?.name || o.customer?.name) === customer.name);
                    const customerRevenue = customerOrders.reduce((sum, o) => 
                      sum + (o.total_price || o.total_amount || 0), 0);
                    
                    return (
                      <div key={customerStr} className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{customerOrders.length} order{customerOrders.length !== 1 ? 's' : ''}</p>
                          <p className="font-semibold text-green-700">
                            {formatCurrency(getDisplayAmount(customerRevenue, true))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
