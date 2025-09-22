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
    
    # Test public products endpoint to see image_url
    print("\n=== Testing Public Products Endpoint ===")
    response = test_endpoint('GET', f"{base_url}/products")
    
    if response and response.status_code == 200:
        products = response.json()
        print(f"\nFound {len(products)} products:")
        for product in products:
            print(f"Product ID {product.get('id')}: {product.get('name')}")
            print(f"  image_url: '{product.get('image_url')}'")
            print(f"  category: '{product.get('category')}'")
            print("---")

if __name__ == "__main__":
    print("=== Starting API Tests ===")
    main()
    print("\n=== Tests Complete ===")
