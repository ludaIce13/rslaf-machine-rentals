import sqlite3
import os

def test_connection():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'smartrentals.db')
    print(f"Testing connection to: {db_path}")
    
    if not os.path.exists(db_path):
        print("Error: Database file does not exist!")
        return False
        
    try:
        # Try to connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Test a simple query
        cursor.execute("SELECT sqlite_version()")
        version = cursor.fetchone()
        print(f"SQLite version: {version[0]}")
        
        # Check if we can list tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if tables:
            print(f"\nFound {len(tables)} tables in the database:")
            for table in tables:
                print(f"- {table[0]}")
        else:
            print("\nNo tables found in the database.")
            
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    if not success:
        print("\nDatabase connection test failed. Please check the error message above.")
