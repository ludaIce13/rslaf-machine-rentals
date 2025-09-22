import os
import sqlite3

def check_database():
    # Possible database locations
    possible_paths = [
        'smartrentals.db',
        'smartrentals_mvp/smartrentals.db',
        os.path.expanduser('~/smartrentals.db'),
        os.path.join(os.getcwd(), 'smartrentals.db')
    ]
    
    print("Checking for database file...")
    db_path = None
    for path in possible_paths:
        if os.path.exists(path):
            db_path = os.path.abspath(path)
            print(f"Found database at: {db_path}")
            break
    
    if not db_path:
        print("Database file not found in any expected location.")
        return
    
    # Connect to the database and list tables
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # List all tables
        print("\nTables in database:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        for table in tables:
            print(f"- {table[0]}")
        
        # Show users table if it exists
        if 'users' in [t[0] for t in tables]:
            print("\nUsers:")
            cursor.execute("SELECT id, email, role FROM users;")
            for row in cursor.fetchall():
                print(f"ID: {row[0]}, Email: {row[1]}, Role: {row[2]}")
        
        # Check products table specifically for image_url
        if 'products' in [t[0] for t in tables]:
            print("\nProducts with image_url:")
            cursor.execute("SELECT id, name, image_url FROM products;")
            products = cursor.fetchall()
            for product in products:
                print(f"ID: {product[0]}, Name: {product[1]}, image_url: '{product[2]}'")
        
        conn.close()
        
    except Exception as e:
        print(f"Error accessing database: {e}")

if __name__ == "__main__":
    print(f"Current working directory: {os.getcwd()}")
    check_database()
