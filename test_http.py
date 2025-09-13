import sys

def main():
    print("=== Python Environment Test ===")
    print(f"Python version: {sys.version}")
    
    print("\nTesting HTTP requests...")
    try:
        import requests
        print("Requests module is installed.")
        
        print("\nTesting HTTP GET to example.com...")
        response = requests.get("https://example.com", timeout=5)
        print(f"Status code: {response.status_code}")
        print(f"Response length: {len(response.text)} characters")
        
    except ImportError:
        print("Error: 'requests' module is not installed.")
        print("Please install it by running: pip install requests")
    except Exception as e:
        print(f"Error during HTTP request: {e}")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
