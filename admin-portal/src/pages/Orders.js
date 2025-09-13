import React, { useState } from 'react';
import { FaEdit, FaEye, FaEllipsisV } from 'react-icons/fa';
import './Orders.css';

const OrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock order data
  const orders = [
    { id: '#SS1024', customer: 'Olivia Rhye', period: 'Oct 25 - Oct 28', status: 'Confirmed', total: '$141.75' },
    { id: '#SS1023', customer: 'Phoenix Baker', period: 'Oct 22 - Oct 24', status: 'Picked up', total: '$250.00' },
    { id: '#SS1022', customer: 'Lana Steiner', period: 'Oct 20 - Oct 23', status: 'Returned', total: '$85.50' },
    { id: '#SS1021', customer: 'Demi Wilkinson', period: 'Oct 19 - Oct 21', status: 'Pending', total: '$199.99' },
    { id: '#SS1020', customer: 'Candice Wu', period: 'Oct 15 - Oct 18', status: 'Cancelled', total: '$50.00' },
  ];

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-500 text-white border border-blue-600';
      case 'Picked up': return 'bg-green-500 text-white border border-green-600';
      case 'Returned': return 'bg-gray-500 text-white border border-gray-600';
      case 'Pending': return 'bg-yellow-500 text-white border border-yellow-600';
      case 'Cancelled': return 'bg-red-500 text-white border border-red-600';
      default: return 'bg-gray-500 text-white border border-gray-600';
    }
  };

  const filteredOrders = orders.filter(order =>
    (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.customer.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'All Statuses' || order.status === statusFilter)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Orders</h2>

      {/* Filters & Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 transition-all duration-200"
            />
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option>All Statuses</option>
            <option>Confirmed</option>
            <option>Picked up</option>
            <option>Returned</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>

          {/* Date Range */}
          <input
            type="text"
            placeholder="mm/dd/yyyy - mm/dd/yyyy"
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48 transition-all duration-200"
          />
        </div>

        {/* New Order Button */}
        <button className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-2.5 rounded-lg font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl">
          <span className="text-lg">+</span>
          <span>New Order</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ORDER ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">CUSTOMER</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PERIOD</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STATUS</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">TOTAL</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.period}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} whitespace-nowrap shadow-sm`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">{order.total}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="action-buttons">
                      <button className="action-btn" title="Edit" onClick={() => console.log('Edit', order.id)}>
                        <FaEdit />
                      </button>
                      <button className="action-btn" title="View" onClick={() => console.log('View', order.id)}>
                        <FaEye />
                      </button>
                      <button className="action-btn" title="More" onClick={() => console.log('More', order.id)}>
                        <FaEllipsisV />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (Optional) */}
      <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
        <p>Showing 1 to {filteredOrders.length} of 5 results</p>
        <div className="flex space-x-2">
          <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200">Previous</button>
          <button className="px-3 py-1.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg shadow-md">1</button>
          <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200">2</button>
          <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200">Next</button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;