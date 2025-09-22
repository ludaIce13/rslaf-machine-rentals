import sqlite3
from datetime import datetime

conn = sqlite3.connect('smartrentals.db')
cursor = conn.cursor()

# Clear existing test orders
cursor.execute("DELETE FROM orders")

# Create a realistic order based on the Bob Cat equipment
cursor.execute("SELECT id FROM products WHERE name LIKE '%Bob%' LIMIT 1")
product_result = cursor.fetchone()
product_id = product_result[0] if product_result else 1

cursor.execute("""
    INSERT INTO orders (customer_id, status, created_at, subtotal, total) 
    VALUES (?, ?, ?, ?, ?)
""", (1, "pending", datetime.now(), 200.00, 220.00))

order_id = cursor.lastrowid

conn.commit()
conn.close()

print(f"✅ Created order #{order_id} for Bob Cat rental - $220.00")
print("Refresh your admin Orders page now!")
