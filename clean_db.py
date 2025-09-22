import sqlite3

# Connect to the database
conn = sqlite3.connect('smartrentals.db')
cursor = conn.cursor()

# Delete any products with "Back Hoe" or "Backhoe" in the name
cursor.execute("DELETE FROM inventory_items WHERE product_id IN (SELECT id FROM products WHERE name LIKE '%Back Hoe%' OR name LIKE '%Backhoe%')")
cursor.execute("DELETE FROM products WHERE name LIKE '%Back Hoe%' OR name LIKE '%Backhoe%'")

conn.commit()

print("Database cleaned - removed any Back Hoe Loader products")

# Show remaining products
cursor.execute("SELECT id, name FROM products;")
products = cursor.fetchall()
print("\nRemaining products:")
for product in products:
    print(f"ID: {product[0]}, Name: {product[1]}")

conn.close()
