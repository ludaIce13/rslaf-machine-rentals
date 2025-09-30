// Simple shared API for cross-domain order sync
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for both portals
app.use(cors({
  origin: [
    'https://rslaf-customer.onrender.com',
    'https://rslaf-admin.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3003'  // Customer portal
  ]
}));

app.use(express.json());

// In-memory storage (replace with database in production)
let orders = [
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
    status: 'pending',
    delivery_status: 'pending',
    payment_status: 'pending',
    payment_method: 'orange_money',
    total_price: 150.00,
    total_hours: 8,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString()
  }
];

// Get all orders
app.get('/api/orders', (req, res) => {
  console.log('📡 Orders requested:', orders.length);
  res.json({ data: orders, count: orders.length });
});

// Create new order
app.post('/api/orders', (req, res) => {
  const newOrder = {
    id: Date.now(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  
  orders.push(newOrder);
  console.log('✅ New order created:', newOrder.id, newOrder.customer_info?.name);
  
  res.status(201).json({ data: newOrder, message: 'Order created successfully' });
});

// Update order
app.put('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  orders[orderIndex] = { ...orders[orderIndex], ...req.body, updated_at: new Date().toISOString() };
  console.log('📝 Order updated:', orderId);
  
  res.json({ data: orders[orderIndex], message: 'Order updated successfully' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', orders: orders.length, timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 RSLAF Shared API running on port ${PORT}`);
  console.log(`📊 Initial orders: ${orders.length}`);
});

module.exports = app;
