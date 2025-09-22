import sqlite3
from datetime import datetime

conn = sqlite3.connect('smartrentals.db')
cursor = conn.cursor()

# Create a test customer if none exists
cursor.execute("SELECT COUNT(*) FROM customers")
customer_count = cursor.fetchone()[0]

if customer_count == 0:
    cursor.execute("""
        INSERT INTO customers (name, email, phone, company, address) 
        VALUES (?, ?, ?, ?, ?)
    """, ("John Smith", "john.smith@example.com", "555-0123", "ABC Construction", "123 Main St"))
    customer_id = cursor.lastrowid
    print(f"Created test customer with ID: {customer_id}")
else:
    cursor.execute("SELECT id FROM customers LIMIT 1")
    customer_id = cursor.fetchone()[0]
    print(f"Using existing customer ID: {customer_id}")

# Create a test order
cursor.execute("""
    INSERT INTO orders (customer_id, status, created_at, subtotal, total) 
    VALUES (?, ?, ?, ?, ?)
""", (customer_id, "pending", datetime.now(), 250.00, 275.00))

order_id = cursor.lastrowid
print(f"Created test order with ID: {order_id}")

# Get product ID for order items
cursor.execute("SELECT id FROM products LIMIT 1")
product_result = cursor.fetchone()
if product_result:
    product_id = product_result[0]
    
    # Check if order_items table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='order_items'")
    if cursor.fetchone():
        cursor.execute("""
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
            VALUES (?, ?, ?, ?, ?)
        """, (order_id, product_id, 1, 250.00, 250.00))
        print("Added order item")

conn.commit()

# Verify the order was created
cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
order = cursor.fetchone()
print(f"\nCreated order: {order}")

conn.close()
print("\nTest order created successfully! Check the admin portal Orders page.")
