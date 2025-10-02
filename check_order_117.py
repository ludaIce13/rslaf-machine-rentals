import requests
import json

print("Checking if Order #117 exists in database...")

# Check all orders
response = requests.get("https://rslaf-backend.onrender.com/orders/public/all", timeout=15)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    orders = response.json()
    print(f"\nTotal orders in database: {len(orders)}")
    
    if orders:
        print("\nAll orders:")
        for order in orders:
            print(f"\n  Order #{order['id']}:")
            print(f"    Customer: {order.get('customer_info', {}).get('name', 'N/A')}")
            print(f"    Equipment: {order.get('equipment_name', 'N/A')}")
            print(f"    Status: {order.get('status', 'N/A')}")
            print(f"    Total: ${order.get('total_price', 0)}")
        
        # Check specifically for order 117
        order_117 = [o for o in orders if o['id'] == 117]
        if order_117:
            print("\n✅ ORDER #117 EXISTS!")
            print(json.dumps(order_117[0], indent=2))
        else:
            print("\n❌ ORDER #117 NOT FOUND in database")
    else:
        print("\n❌ NO ORDERS in database - Order creation is failing!")
else:
    print(f"Error: {response.text}")
