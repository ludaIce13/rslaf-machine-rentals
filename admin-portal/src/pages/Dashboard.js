import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBox, FaWarehouse, FaShoppingCart, FaUsers, FaUserCog, FaDollarSign, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    inventory: 0,
    orders: 0,
    customers: 0,
    users: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [productsRes, inventoryRes, ordersRes, customersRes, usersRes] = await Promise.all([
        axios.get('/products'),
        axios.get('/inventory'),
        axios.get('/orders'),
        axios.get('/customers'),
        axios.get('/auth/admin/users').catch(() => ({ data: [] }))
      ]);

      setStats({
        products: productsRes.data.length,
        inventory: inventoryRes.data.length,
        orders: ordersRes.data.length,
        customers: customersRes.data.length,
        users: usersRes.data.length,
        revenue: ordersRes.data.reduce((sum, order) => sum + (order.total || 0), 0)
      });

      // Get recent orders (last 5)
      setRecentOrders(ordersRes.data.slice(-5).reverse());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.products,
      icon: FaBox,
      color: '#3498db'
    },
    {
      title: 'Inventory Items',
      value: stats.inventory,
      icon: FaWarehouse,
      color: '#e74c3c'
    },
    {
      title: 'Total Orders',
      value: stats.orders,
      icon: FaShoppingCart,
      color: '#27ae60'
    },
    {
      title: 'Customers',
      value: stats.customers,
      icon: FaUsers,
      color: '#f39c12'
    },
    {
      title: 'System Users',
      value: stats.users,
      icon: FaUserCog,
      color: '#9b59b6'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.revenue.toFixed(2)}`,
      icon: FaDollarSign,
      color: '#1abc9c'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Welcome to SmartRentals Admin Panel</p>
      </div>
      
      <div className="page-content">
        {/* Statistics Cards */}
        <div className="stats-grid">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                <div className="stat-icon" style={{ color: stat.color }}>
                  <Icon />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-title">{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section">
          <h2>Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="no-data">No orders yet</p>
          ) : (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer_id}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>${order.total}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/orders/new" className="action-btn primary">
              <FaPlus />
              New Order
            </Link>
            <Link to="/inventory" className="action-btn success">
              <FaWarehouse />
              Add Inventory
            </Link>
            <Link to="/customers" className="action-btn warning">
              <FaUsers />
              View Customers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;