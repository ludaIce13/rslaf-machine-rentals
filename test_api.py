import requests
import sys

def print_response(response):
    print(f"Status: {response.status_code}")
    try:
        import json
        data = response.json()
        print("Response:", json.dumps(data, indent=2))
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
    base = "https://rslaf-backend.onrender.com"

    # 1) List orders (before)
    print("\n=== 1) LIST ORDERS (BEFORE) ===")
    test_endpoint("get", f"{base}/orders/public/all")

    # 2) Create one simple order
    print("\n=== 2) CREATE TEST ORDER ===")
    payload = {
        "name": "Test Customer",
        "email": "test@example.com",
        "phone": "+23278000000",
        "equipment_name": "Test Excavator",
        "total_price": 25,
        "payment_method": "orange_money",
        "start_date": "2025-10-01T09:00:00",
        "end_date": "2025-10-01T12:00:00",
        "total_hours": 3
    }
    test_endpoint("post", f"{base}/orders/public/create-simple", json=payload)

    # 3) List orders (after)
    print("\n=== 3) LIST ORDERS (AFTER) ===")
    test_endpoint("get", f"{base}/orders/public/all")

if __name__ == "__main__":
    print("=== Starting API Tests ===")
    main()
    print("\n=== Tests Complete ===")
