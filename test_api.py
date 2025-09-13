import requests
import sys

def print_response(response):
    print(f"Status: {response.status_code}")
    try:
        print("Response:", response.json())
    except ValueError:
        print("Response (text):", response.text)

def test_endpoint(method, url, **kwargs):
    print(f"\n{method.upper()} {url}")
    try:
        response = requests.request(method, url, **kwargs, timeout=5)
        print_response(response)
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def main():
    base_url = "http://localhost:8000"
    
    # Test root endpoint
    print("\n=== Testing Root Endpoint ===")
    test_endpoint('GET', f"{base_url}/")
    
    # Test login
    print("\n=== Testing Login ===")
    login_data = {
        "username": "admin@smartrentals.com",
        "password": "admin123"
    }
    login_response = test_endpoint('POST', f"{base_url}/auth/login", json=login_data)
    
    auth_token = None
    if login_response and login_response.status_code == 200:
        auth_token = login_response.json().get('access_token')
        print(f"\nAuthentication successful. Token: {auth_token[:20]}...")
    
    if auth_token:
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Test protected endpoints
        print("\n=== Testing Products Endpoint ===")
        products_response = test_endpoint('GET', f"{base_url}/products", headers=headers)
        
        if products_response and products_response.status_code == 200:
            products = products_response.json()
            if products and len(products) > 0:
                print("\n=== Testing Product Availability ===")
                from datetime import datetime, timedelta
                start_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
                end_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
                test_endpoint(
                    'GET',
                    f"{base_url}/availability/products/{products[0]['id']}",
                    headers=headers,
                    params={"start_date": start_date, "end_date": end_date}
                )
        
        print("\n=== Testing Orders Endpoint ===")
        test_endpoint('GET', f"{base_url}/orders", headers=headers)
    
    # Test public endpoints
    print("\n=== Testing Public Products Endpoint ===")
    test_endpoint('GET', f"{base_url}/products")

if __name__ == "__main__":
    print("=== Starting API Tests ===")
    main()
    print("\n=== Tests Complete ===")
