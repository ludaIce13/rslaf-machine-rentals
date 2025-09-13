import os

def test_file_operations():
    # Get the current working directory
    current_dir = os.getcwd()
    print(f"Current working directory: {current_dir}")
    
    # List files in the current directory
    print("\nFiles in current directory:")
    try:
        files = os.listdir('.')
        for file in files:
            print(f"- {file}")
    except Exception as e:
        print(f"Error listing directory: {e}")
    
    # Test file creation
    test_file = os.path.join(current_dir, 'test_file.txt')
    print(f"\nAttempting to create test file: {test_file}")
    
    try:
        with open(test_file, 'w') as f:
            f.write("This is a test file.")
        print("Successfully created test file.")
        
        # Verify the file was created
        if os.path.exists(test_file):
            print("Test file exists.")
            with open(test_file, 'r') as f:
                content = f.read()
                print(f"File content: {content}")
            
            # Clean up
            os.remove(test_file)
            print("Test file deleted.")
        else:
            print("Test file was not created successfully.")
            
    except Exception as e:
        print(f"Error during file operations: {e}")
        
    # Check SQLite database file
    db_file = os.path.join(current_dir, 'smartrentals.db')
    print(f"\nChecking for database file: {db_file}")
    if os.path.exists(db_file):
        print("Database file exists.")
        print(f"File size: {os.path.getsize(db_file)} bytes")
    else:
        print("Database file does not exist.")

if __name__ == "__main__":
    test_file_operations()
