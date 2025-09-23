#!/usr/bin/env python3
"""
RSLAF Equipment Rental - Web Database Viewer
Simple web interface to view orders and bookings
"""

from flask import Flask, render_template_string, jsonify
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'smartrentals.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

@app.route('/')
def dashboard():
    """Main dashboard"""
    return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <title>RSLAF Database Viewer</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #2d5016 0%, #4a7c59 100%);
            min-height: 100vh;
            color: white;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: rgba(255,255,255,0.95);
            border-radius: 15px;
            padding: 30px;
            color: #333;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        h1 { 
            color: #2d5016; 
            text-align: center; 
            margin-bottom: 30px;
            font-size: 2.5rem;
        }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .stat-card { 
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white; 
            padding: 20px; 
            border-radius: 10px; 
            text-align: center;
            box-shadow: 0 5px 15px rgba(40,167,69,0.3);
        }
        .stat-number { 
            font-size: 2rem; 
            font-weight: bold; 
            margin-bottom: 5px; 
        }
        .stat-label { 
            font-size: 0.9rem; 
            opacity: 0.9; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #ddd; 
        }
        th { 
            background: #2d5016; 
            color: white; 
            font-weight: 600;
        }
        tr:hover { 
            background-color: #f5f5f5; 
        }
        .status { 
            padding: 5px 10px; 
            border-radius: 15px; 
            font-size: 0.8rem; 
            font-weight: bold; 
        }
        .status-paid { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-confirmed { background: #cce5ff; color: #004085; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        .refresh-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;
            margin-bottom: 20px;
        }
        .refresh-btn:hover {
            background: #218838;
        }
        .timestamp {
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 RSLAF Equipment Rental Database</h1>
        
        <div class="stats" id="stats">
            <div class="stat-card">
                <div class="stat-number" id="total-orders">-</div>
                <div class="stat-label">Total Orders</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="paid-orders">-</div>
                <div class="stat-label">Paid Orders</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="total-revenue">-</div>
                <div class="stat-label">Total Revenue</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="unique-customers">-</div>
                <div class="stat-label">Customers</div>
            </div>
        </div>
        
        <button class="refresh-btn" onclick="loadData()">🔄 Refresh Data</button>
        
        <h2>📋 Recent Orders</h2>
        <div id="orders-table">Loading...</div>
        
        <p class="timestamp">Last updated: <span id="last-updated">-</span></p>
    </div>

    <script>
        function formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount || 0);
        }
        
        function getStatusClass(status) {
            return 'status status-' + (status || 'pending').toLowerCase();
        }
        
        function loadData() {
            // Load statistics
            fetch('/api/stats')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('total-orders').textContent = data.total_orders;
                    document.getElementById('paid-orders').textContent = data.paid_orders;
                    document.getElementById('total-revenue').textContent = formatCurrency(data.total_revenue);
                    document.getElementById('unique-customers').textContent = data.unique_customers;
                });
            
            // Load orders
            fetch('/api/orders')
                .then(response => response.json())
                .then(data => {
                    let html = '<table><thead><tr>';
                    html += '<th>ID</th><th>Customer</th><th>Equipment</th><th>Price</th>';
                    html += '<th>Status</th><th>Payment</th><th>Date</th></tr></thead><tbody>';
                    
                    data.forEach(order => {
                        html += '<tr>';
                        html += '<td>#' + order.id + '</td>';
                        html += '<td>' + (order.customer_name || 'N/A') + '</td>';
                        html += '<td>' + (order.equipment_name || 'N/A') + '</td>';
                        html += '<td>' + formatCurrency(order.total_price) + '</td>';
                        html += '<td><span class="' + getStatusClass(order.status) + '">' + (order.status || 'pending').toUpperCase() + '</span></td>';
                        html += '<td>' + (order.payment_method || 'N/A') + '</td>';
                        html += '<td>' + (order.created_at || 'N/A') + '</td>';
                        html += '</tr>';
                    });
                    
                    html += '</tbody></table>';
                    document.getElementById('orders-table').innerHTML = html;
                });
            
            document.getElementById('last-updated').textContent = new Date().toLocaleString();
        }
        
        // Load data on page load
        loadData();
        
        // Auto-refresh every 30 seconds
        setInterval(loadData, 30000);
    </script>
</body>
</html>
    ''')

@app.route('/api/stats')
def api_stats():
    """Get order statistics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM orders")
        total_orders = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'paid'")
        paid_orders = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(total_price) FROM orders WHERE status = 'paid'")
        total_revenue = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(DISTINCT customer_name) FROM orders")
        unique_customers = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'total_orders': total_orders,
            'paid_orders': paid_orders,
            'total_revenue': float(total_revenue),
            'unique_customers': unique_customers
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders')
def api_orders():
    """Get recent orders"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, customer_name, equipment_name, total_price, 
                   status, payment_method, created_at
            FROM orders 
            ORDER BY created_at DESC 
            LIMIT 50
        """)
        
        orders = []
        for row in cursor.fetchall():
            orders.append({
                'id': row['id'],
                'customer_name': row['customer_name'],
                'equipment_name': row['equipment_name'],
                'total_price': row['total_price'],
                'status': row['status'],
                'payment_method': row['payment_method'],
                'created_at': row['created_at']
            })
        
        conn.close()
        return jsonify(orders)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🌐 Starting RSLAF Database Viewer...")
    print("📊 Access at: http://localhost:5001")
    print("🔄 Auto-refreshes every 30 seconds")
    print("Press Ctrl+C to stop")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
