import requests
import json

print("Testing order creation...")

url = "https://rslaf-backend.onrender.com/orders/public/create-simple"
payload = {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+23278123456",
    "equipment_name": "CAT 320 Excavator",
    "total_price": 100.00,
    "payment_method": "orange_money",
    "start_date": "2025-10-02T09:00:00",
    "end_date": "2025-10-02T17:00:00",
    "total_hours": 8
}

print(f"\nPOST {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload, timeout=10)
    print(f"\nStatus: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Success! Order created with ID: {data.get('id')}")
        print(f"Full response: {json.dumps(data, indent=2)}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")

# Now check if order appears in list
print("\n\nChecking orders list...")
try:
    response = requests.get("https://rslaf-backend.onrender.com/orders/public/all", timeout=10)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        orders = response.json()
        print(f"Total orders: {len(orders)}")
        if orders:
            print(f"Orders: {json.dumps(orders, indent=2)}")
        else:
            print("No orders found in database!")
except Exception as e:
    print(f"Request failed: {e}")
