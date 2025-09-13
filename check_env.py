import sys
import os
import sys
import platform
import sqlite3

def check_environment():
    print("=== Python Environment ===")
    print(f"Python version: {sys.version}")
    print(f"Platform: {platform.platform()}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Python executable: {sys.executable}")
    
    print("\n=== File System Access ===")
    test_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Script directory: {test_dir}")
    
    # Check if we can list files in the current directory
    try:
        files = os.listdir('.')
        print("\nFiles in current directory:")
        for f in files[:10]:  # Show first 10 files
            print(f"- {f}")
        if len(files) > 10:
            print(f"... and {len(files) - 10} more files")
    except Exception as e:
        print(f"Error listing directory: {e}")
    
    # Check database file
    db_path = os.path.join(test_dir, 'smartrentals.db')
    print(f"\nChecking database file: {db_path}")
    if os.path.exists(db_path):
        print(f"Database file exists. Size: {os.path.getsize(db_path)} bytes")
        
        # Try to read from the database
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            print(f"\nFound {len(tables)} tables in the database:")
            for table in tables[:5]:  # Show first 5 tables
                print(f"- {table[0]}")
            if len(tables) > 5:
                print(f"... and {len(tables) - 5} more tables")
            conn.close()
        except Exception as e:
            print(f"Error reading database: {e}")
    else:
        print("Database file does not exist.")
    
    # Test file creation
    test_file = os.path.join(test_dir, 'test_write.txt')
    print(f"\nTesting file creation: {test_file}")
    try:
        with open(test_file, 'w') as f:
            f.write("This is a test file.")
        print("Successfully created test file.")
        os.remove(test_file)
        print("Successfully deleted test file.")
    except Exception as e:
        print(f"Error during file operations: {e}")

if __name__ == "__main__":
    check_environment()

print("\n=== Installed Packages ===")
try:
    import pkg_resources
    installed_packages = pkg_resources.working_set
    installed_packages_list = sorted([f"{i.key}=={i.version}" for i in installed_packages])
    print("\n".join(installed_packages_list))
except Exception as e:
    print(f"Error checking installed packages: {e}")

print("\n=== File System Check ===")
try:
    print(f"Current directory contents: {os.listdir('.')}")
    print(f"smartrentals_mvp directory exists: {os.path.exists('smartrentals_mvp')}")
    if os.path.exists('smartrentals_mvp'):
        print(f"smartrentals_mvp contents: {os.listdir('smartrentals_mvp')}")
except Exception as e:
    print(f"Error checking file system: {e}")
