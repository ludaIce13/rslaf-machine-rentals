import os
import sys
import subprocess
import socket

def check_port(port=8000):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def main():
    print("=== Backend Server Status Check ===\n")
    
    # Check if port 8000 is in use
    port_in_use = check_port()
    print(f"Port 8000 status: {'In use' if port_in_use else 'Available'}")
    
    # Check if the backend server process is running
    print("\nChecking for backend server processes...")
    try:
        result = subprocess.run(
            ['tasklist', '/FI', 'IMAGENAME eq python.exe', '/FI', 'WINDOWTITLE eq smartrentals*'],
            capture_output=True,
            text=True,
            shell=True
        )
        print(result.stdout or "No matching processes found.")
    except Exception as e:
        print(f"Error checking processes: {e}")
    
    # Check for backend log file
    log_path = os.path.join('smartrentals_mvp', 'logs', 'backend.log')
    print(f"\nChecking for log file at: {log_path}")
    if os.path.exists(log_path):
        print("Log file exists. Last 10 lines:")
        try:
            with open(log_path, 'r') as f:
                lines = f.readlines()
                print(''.join(lines[-10:]) if len(lines) > 0 else "Log file is empty.")
        except Exception as e:
            print(f"Error reading log file: {e}")
    else:
        print("Log file does not exist.")
    
    # Check if we can access the API
    print("\nTesting API access...")
    try:
        import requests
        response = requests.get('http://localhost:8000/', timeout=5)
        print(f"API root endpoint status: {response.status_code}")
        print(f"Response: {response.text}")
    except ImportError:
        print("Requests module not available. Install with: pip install requests")
    except Exception as e:
        print(f"Error accessing API: {e}")
    
    print("\n=== Check Complete ===")
    print("\nIf the backend is not running, you can start it with:")
    print("1. Open a new command prompt")
    print("2. Navigate to the project directory")
    print("3. Run: .\\start_backend.bat")
    print("\nOr to start it directly, run:")
    print("cd smartrentals_mvp && .\\venv\\Scripts\\uvicorn app.main:app --reload --port 8000")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
