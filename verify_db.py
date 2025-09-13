import os
import sqlite3

def verify_database():
    # Define the expected database path
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'smartrentals.db')
    
    print(f"Checking for database at: {db_path}")
    
    if not os.path.exists(db_path):
        print("Error: Database file not found at the expected location.")
        print("Current working directory:", os.getcwd())
        print("Files in directory:", os.listdir('.'))
        return
    
    print("Database file found!")
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # List all tables
        print("\nTables in database:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found in the database!")
            return
            
        for table in tables:
            print(f"- {table[0]}")
        
        # Check if users table exists and has data
        if 'users' in [t[0] for t in tables]:
            print("\nUsers:")
            cursor.execute("SELECT id, email, role FROM users;")
            users = cursor.fetchall()
            if users:
                for user in users:
                    print(f"ID: {user[0]}, Email: {user[1]}, Role: {user[2]}")
            else:
                print("No users found in the users table.")
        
        # Check products
        if 'products' in [t[0] for t in tables]:
            print("\nProducts:")
            cursor.execute("SELECT id, name, sku, daily_rate FROM products;")
            products = cursor.fetchall()
            if products:
                for p in products:
                    print(f"ID: {p[0]}, Name: {p[1]}, SKU: {p[2]}, Daily Rate: ${p[3]:.2f}")
            else:
                print("No products found.")
        
        conn.close()
        
    except Exception as e:
        print(f"Error accessing database: {e}")

if __name__ == "__main__":
    verify_database()
