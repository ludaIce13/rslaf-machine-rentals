import sqlite3
import os

def inspect_database():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'smartrentals.db')
    print(f"Inspecting database at: {db_path}")
    
    if not os.path.exists(db_path):
        print("Error: Database file does not exist!")
        return
        
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found in the database!")
            return
            
        print("\nTables in the database:")
        for table in tables:
            table_name = table[0]
            print(f"\nTable: {table_name}")
            print("-" * (len(table_name) + 8))
            
            # Get table structure
            try:
                cursor.execute(f"PRAGMA table_info({table_name});")
                columns = cursor.fetchall()
                print("Columns:")
                for col in columns:
                    print(f"  {col[1]} ({col[2]}) - {'PK' if col[5] == 1 else ''}")
                
                # Get row count
                cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
                count = cursor.fetchone()[0]
                print(f"\nRow count: {count}")
                
                # Show first few rows if table is not empty
                if count > 0:
                    print("\nSample data:")
                    cursor.execute(f"SELECT * FROM {table_name} LIMIT 3;")
                    rows = cursor.fetchall()
                    for row in rows:
                        print(f"  {row}")
                    if count > 3:
                        print(f"  ... and {count - 3} more rows")
                        
            except sqlite3.Error as e:
                print(f"Error inspecting table {table_name}: {e}")
                
        conn.close()
        
    except Exception as e:
        print(f"Error accessing database: {e}")

if __name__ == "__main__":
    inspect_database()
