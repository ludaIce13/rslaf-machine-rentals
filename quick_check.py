import requests
import json

print("Checking production backend...")
try:
    response = requests.get("https://rslaf-backend.onrender.com/orders/public/all", timeout=15)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        orders = response.json()
        print(f"\nTotal orders in database: {len(orders)}")
        
        if orders:
            print("\nOrders found:")
            for order in orders[-5:]:  # Show last 5
                print(f"\nOrder #{order.get('id')}:")
                print(f"  Customer: {order.get('customer_info', {}).get('name', 'N/A')}")
                print(f"  Equipment: {order.get('equipment_name', 'N/A')}")
                print(f"  Status: {order.get('status', 'N/A')}")
                print(f"  Total: {order.get('total_price', 0)}")
        else:
            print("\n❌ NO ORDERS FOUND IN DATABASE!")
            print("This means orders are NOT being saved to production backend.")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Failed: {e}")
