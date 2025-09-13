import sys
import os
import subprocess
import time
import webbrowser

def check_port(port=8000):
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def start_backend():
    print("Starting backend server...")
    try:
        # Start the backend server in a new console window
        subprocess.Popen(
            ["cmd", "/c", "start", "cmd", "/k", "cd /d %CD% && .\\start_backend.bat"],
            shell=True
        )
        print("Backend server is starting in a new window. Please wait...")
        time.sleep(5)  # Give it some time to start
        return True
    except Exception as e:
        print(f"Failed to start backend: {e}")
        return False

def test_endpoint(url):
    try:
        import requests
        response = requests.get(url, timeout=5)
        print(f"GET {url}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}..." if len(response.text) > 200 else f"Response: {response.text}")
        return True
    except Exception as e:
        print(f"Error accessing {url}: {e}")
        return False

def main():
    print("=== SmartRentals Backend Verification ===\n")
    
    # Check if backend is running
    if not check_port():
        print("Backend server is not running on port 8000.")
        if input("Would you like to start it? (y/n): ").lower() == 'y':
            if not start_backend():
                print("Failed to start backend server.")
                return
            # Wait a bit more for the server to fully start
            time.sleep(3)
    
    # Test the backend
    base_url = "http://localhost:8000"
    print("\n=== Testing Backend Endpoints ===")
    
    # Test root endpoint
    print("\n1. Testing root endpoint...")
    if not test_endpoint(base_url + "/"):
        print("\nCould not connect to the backend. Please check the server logs.")
        return
    
    # Open in browser if possible
    if input("\nWould you like to open the API in your browser? (y/n): ").lower() == 'y':
        webbrowser.open(base_url + "/docs")
    
    print("\n=== Verification Complete ===")
    print("If you're having issues, please check:")
    print("1. The backend server console for any error messages")
    print("2. The logs in smartrentals_mvp/logs/")
    print("3. Make sure port 8000 is not blocked by your firewall")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
    except Exception as e:
        print(f"\nAn error occurred: {e}")
    
    input("\nPress Enter to exit...")
