import requests
import json
import sys
from datetime import datetime, timedelta

def test_endpoint(method, url, headers=None, data=None):
    try:
        method = method.upper()
        print(f"\n{method} {url}")
        
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=5)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=5)
        else:
            print(f"Unsupported method: {method}")
            return None
            
        print(f"Status: {response.status_code}")
        
        try:
            json_response = response.json()
            print("Response:")
            print(json.dumps(json_response, indent=2))
            return json_response
        except ValueError:
            print(f"Response (raw): {response.text}")
            return response.text
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def test_backend():
    base_url = "http://localhost:8000"
    
    # 1. Test root endpoint
    print("\n=== 1. Testing Root Endpoint ===")
    test_endpoint('GET', f"{base_url}/")
    
    # 2. Test login
    print("\n=== 2. Testing Login ===")
    login_data = {
        "username": "admin@smartrentals.com",
        "password": "admin123"
    }
    
    login_response = test_endpoint('POST', f"{base_url}/auth/login", data=login_data)
    
    auth_token = None
    if login_response and 'access_token' in login_response:
        auth_token = login_response['access_token']
        print(f"\nAuthentication successful. Token: {auth_token[:20]}...")
    
    # 3. Test protected endpoints with token
    if auth_token:
        headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
        
        # Test products endpoint
        print("\n=== 3. Testing Products Endpoint ===")
        products = test_endpoint('GET', f"{base_url}/products", headers=headers)
        
        # If we have products, test availability
        if products and isinstance(products, list) and len(products) > 0:
            product_id = products[0].get('id')
            if product_id:
                print("\n=== 4. Testing Product Availability ===")
                start_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
                end_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
                test_endpoint(
                    'GET', 
                    f"{base_url}/availability/products/{product_id}",
                    headers=headers,
                    data={"start_date": start_date, "end_date": end_date}
                )
        
        # Test orders endpoint
        print("\n=== 5. Testing Orders Endpoint ===")
        test_endpoint('GET', f"{base_url}/orders", headers=headers)
    
    # 4. Test public endpoints (should work without auth)
    print("\n=== 6. Testing Public Products Endpoint ===")
    test_endpoint('GET', f"{base_url}/products")
    
    print("\n=== Tests Complete ===")

if __name__ == "__main__":
    print("=== Starting Backend API Tests ===")
    test_backend()
