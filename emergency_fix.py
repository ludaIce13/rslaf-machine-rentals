import sqlite3

# Connect to the database
conn = sqlite3.connect('smartrentals.db')
cursor = conn.cursor()

# Check current products and their image URLs
print("Current products in database:")
cursor.execute("SELECT id, name, image_url FROM products;")
products = cursor.fetchall()
for product in products:
    print(f"ID: {product[0]}, Name: {product[1]}, image_url: '{product[2]}'")

# Update any relative image URLs to absolute URLs
print("\nConverting relative URLs to absolute URLs...")
cursor.execute("UPDATE products SET image_url = 'https://rslaf-backend.onrender.com' || image_url WHERE image_url LIKE '/static/%'")
affected = cursor.rowcount
print(f"Updated {affected} products")

# Commit changes
conn.commit()

print("\nUpdated products:")
cursor.execute("SELECT id, name, image_url FROM products;")
products = cursor.fetchall()
for product in products:
    print(f"ID: {product[0]}, Name: {product[1]}, image_url: '{product[2]}'")

conn.close()
print("\nDatabase updated successfully!")
