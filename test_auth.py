import requests
import json

# Test login
login_url = "http://localhost:8000/auth/login"
login_data = {
    "username": "admin@example.com",  # Replace with your admin email
    "password": "admin"               # Replace with your admin password
}

try:
    # Login to get token
    print("Attempting to log in...")
    response = requests.post(
        f"{login_url}",
        data=login_data
    )
    response.raise_for_status()
    
    token = response.json().get("access_token")
    if not token:
        print("Error: No token received in response")
        print(response.json())
        exit(1)
        
    print("Successfully logged in!")
    
    # Test orders endpoint with token
    print("\nTesting /orders endpoint...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    orders_response = requests.get(
        "http://localhost:8000/orders",
        headers=headers
    )
    
    print(f"Status Code: {orders_response.status_code}")
    print("Response:")
    print(json.dumps(orders_response.json(), indent=2))
    
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Response status: {e.response.status_code}")
        print(f"Response body: {e.response.text}")
