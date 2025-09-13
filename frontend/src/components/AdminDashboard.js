import React, { useState, useEffect } from 'react';
import {
  getProducts,
  getInventory,
  getCustomers,
  getOrders,
  getAllUsers,
  createProduct,
  createInventoryItem,
  updateOrderStatus,
  login
} from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    products: [],
    inventory: [],
    customers: [],
    orders: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(null);
  const [formData, setFormData] = useState({});

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, inventoryRes, customersRes, ordersRes, usersRes] = await Promise.all([
        getProducts(),
        getInventory(),
        getCustomers(),
        getOrders(),
        getAllUsers().catch(() => ({ data: [] })) // Admin only
      ]);

      setData({
        products: productsRes.data,
        inventory: inventoryRes.data,
        customers: customersRes.data,
        orders: ordersRes.data,
        users: usersRes.data || []
      });
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await login(loginData);
      localStorage.setItem('token', response.data.access_token);
      setIsLoggedIn(true);
      loadData();
    } catch (error) {
      setLoginError(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setData({ products: [], inventory: [], customers: [], orders: [], users: [] });
  };

  const handleFormSubmit = async (e, endpoint) => {
    e.preventDefault();
    try {
      if (endpoint === 'product') {
        await createProduct(formData);
      } else if (endpoint === 'inventory') {
        await createInventoryItem(formData);
      }
      setShowForm(null);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const updateOrderStatusHandler = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
          {loginError && <p style={{ color: 'red', marginBottom: '10px' }}>{loginError}</p>}
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>SmartRentals Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ marginBottom: '20px' }}>
        {['overview', 'products', 'inventory', 'customers', 'orders', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: activeTab === tab ? '#007bff' : '#f8f9fa',
              color: activeTab === tab ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                <h3>{data.products.length}</h3>
                <p>Products</p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                <h3>{data.inventory.length}</h3>
                <p>Inventory Items</p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                <h3>{data.customers.length}</h3>
                <p>Customers</p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                <h3>{data.orders.length}</h3>
                <p>Orders</p>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={() => setShowForm('product')}
                  style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Add Product
                </button>
              </div>

              {showForm === 'product' && (
                <form onSubmit={(e) => handleFormSubmit(e, 'product')} style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <h3>Add New Product</h3>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '60px' }}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Daily Rate"
                    value={formData.daily_rate || ''}
                    onChange={(e) => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="SKU"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    required
                  />
                  <div>
                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', marginRight: '10px' }}>
                      Save
                    </button>
                    <button type="button" onClick={() => setShowForm(null)} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div style={{ display: 'grid', gap: '10px' }}>
                {data.products.map(product => (
                  <div key={product.id} style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h4>{product.name}</h4>
                    <p>{product.description}</p>
                    <p><strong>SKU:</strong> {product.sku} | <strong>Daily Rate:</strong> ${product.daily_rate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={() => setShowForm('inventory')}
                  style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Add Inventory Item
                </button>
              </div>

              {showForm === 'inventory' && (
                <form onSubmit={(e) => handleFormSubmit(e, 'inventory')} style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <h3>Add Inventory Item</h3>
                  <select
                    value={formData.product_id || ''}
                    onChange={(e) => setFormData({ ...formData, product_id: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    required
                  >
                    <option value="">Select Product</option>
                    {data.products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Label"
                    value={formData.label || ''}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                  />
                  <div>
                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', marginRight: '10px' }}>
                      Save
                    </button>
                    <button type="button" onClick={() => setShowForm(null)} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div style={{ display: 'grid', gap: '10px' }}>
                {data.inventory.map(item => (
                  <div key={item.id} style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h4>{item.label}</h4>
                    <p><strong>Product:</strong> {data.products.find(p => p.id === item.product_id)?.name}</p>
                    <p><strong>Location:</strong> {item.location} | <strong>Active:</strong> {item.active ? 'Yes' : 'No'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {data.orders.map(order => (
                  <div key={order.id} style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4>Order #{order.id}</h4>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatusHandler(order.id, e.target.value)}
                        style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                    </div>
                    <p><strong>Customer ID:</strong> {order.customer_id}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Total:</strong> ${order.total}</p>
                    <p><strong>Created:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {data.customers.map(customer => (
                <div key={customer.id} style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <h4>{customer.name}</h4>
                  <p><strong>Email:</strong> {customer.email}</p>
                  <p><strong>Phone:</strong> {customer.phone}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {data.users.map(user => (
                <div key={user.id} style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <h4>{user.email}</h4>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Active:</strong> {user.is_active ? 'Yes' : 'No'}</p>
                  <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;