import sqlite3

# Connect to the database
conn = sqlite3.connect('smartrentals.db')
cursor = conn.cursor()

# First, let's see what products exist
print("Current products:")
cursor.execute("SELECT id, name FROM products;")
products = cursor.fetchall()
for product in products:
    print(f"ID: {product[0]}, Name: {product[1]}")

# Delete the Back Hoe Loader product (assuming it's ID 1)
product_id_to_delete = 1

print(f"\nDeleting product with ID {product_id_to_delete}...")

# First delete associated inventory items
cursor.execute("DELETE FROM inventory_items WHERE product_id = ?", (product_id_to_delete,))
print(f"Deleted {cursor.rowcount} inventory items")

# Then delete the product
cursor.execute("DELETE FROM products WHERE id = ?", (product_id_to_delete,))
print(f"Deleted {cursor.rowcount} product")

# Commit the changes
conn.commit()

print("\nRemaining products:")
cursor.execute("SELECT id, name FROM products;")
products = cursor.fetchall()
for product in products:
    print(f"ID: {product[0]}, Name: {product[1]}")

conn.close()
print("\nProduct deleted successfully!")
