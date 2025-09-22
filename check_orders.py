import sqlite3

conn = sqlite3.connect('smartrentals.db')
cursor = conn.cursor()

# Check what tables exist
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Available tables:", [t[0] for t in tables])

# Check orders table structure
try:
    cursor.execute("PRAGMA table_info(orders)")
    columns = cursor.fetchall()
    print("\nOrders table columns:")
    for col in columns:
        print(f"  {col[1]} ({col[2]})")
    
    # Check for any orders
    cursor.execute("SELECT COUNT(*) FROM orders")
    count = cursor.fetchone()[0]
    print(f"\nTotal orders in database: {count}")
    
    if count > 0:
        cursor.execute("SELECT * FROM orders ORDER BY id DESC LIMIT 3")
        orders = cursor.fetchall()
        print("\nRecent orders:")
        for order in orders:
            print(f"  Order ID: {order[0]}")
            
except Exception as e:
    print(f"Error checking orders table: {e}")

conn.close()
