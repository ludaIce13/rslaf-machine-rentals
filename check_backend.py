import sys
import subprocess

def check_backend():
    print("Checking if backend server is running...")
    
    # Try to make a GET request to the root endpoint
    try:
        import requests
        response = requests.get("http://localhost:8000/", timeout=5)
        print(f"Backend is running! Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Could not connect to backend: {e}")
        return False

def start_backend():
    print("\nStarting backend server...")
    try:
        # Start the backend server in a new process
        subprocess.Popen(
            ["python", "-m", "uvicorn", "smartrentals_mvp.app.main:app", "--reload", "--port", "8000"],
            cwd=os.getcwd(),
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
        print("Backend server started in a new window.")
        print("Please wait a few seconds for the server to initialize...")
        return True
    except Exception as e:
        print(f"Failed to start backend server: {e}")
        return False

if __name__ == "__main__":
    import os
    import time
    
    if not check_backend():
        print("\nBackend server is not running. Would you like to start it? (y/n)")
        if input().strip().lower() == 'y':
            if start_backend():
                # Give the server a moment to start
                time.sleep(5)
                # Check again if the server is up
                if not check_backend():
                    print("\nBackend server did not start properly. Please check for errors.")
    else:
        print("\nBackend server is already running. You can run the test script now.")
