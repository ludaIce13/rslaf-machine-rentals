import os
import sys
from sqlalchemy import create_engine, inspect

def check_database_connection():
    # Define the database path
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'smartrentals.db')
    database_url = f"sqlite:///{db_path}"
    
    print(f"Attempting to connect to database at: {db_path}")
    
    try:
        # Try to create the engine
        engine = create_engine(database_url, connect_args={"check_same_thread": False})
        
        # Test the connection
        with engine.connect() as conn:
            print("Successfully connected to the database!")
            
            # Get table information
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            
            if tables:
                print("\nTables in the database:")
                for table in tables:
                    print(f"- {table}")
            else:
                print("\nNo tables found in the database.")
                
    except Exception as e:
        print(f"\nError connecting to the database: {e}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Files in directory: {os.listdir('.')}")
        
        # Check if the directory is writable
        test_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_write.txt')
        try:
            with open(test_file, 'w') as f:
                f.write("Test write operation")
            os.remove(test_file)
            print("\nThe directory is writable.")
        except Exception as write_error:
            print(f"\nCannot write to directory: {write_error}")

if __name__ == "__main__":
    check_database_connection()
