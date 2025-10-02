import requests
import json

print("=" * 60)
print("CLEARING ALL ORDERS AND RESETTING SYSTEM")
print("=" * 60)

base = "https://rslaf-backend.onrender.com"

# Step 1: Get all orders
print("\n[1] Fetching all orders from database...")
try:
    response = requests.get(f"{base}/orders/public/all", timeout=15)
    if response.status_code == 200:
        orders = response.json()
        print(f"Found {len(orders)} orders to delete")
        
        if len(orders) > 0:
            # Step 2: Delete each order
            print(f"\n[2] Deleting {len(orders)} orders...")
            for order in orders:
                order_id = order['id']
                try:
                    del_response = requests.delete(f"{base}/orders/public/{order_id}", timeout=10)
                    if del_response.status_code == 200:
                        print(f"  ✅ Deleted order #{order_id}")
                    else:
                        print(f"  ⚠️  Failed to delete order #{order_id}")
                except Exception as e:
                    print(f"  ❌ Error deleting order #{order_id}: {e}")
            
            # Step 3: Verify all deleted
            print("\n[3] Verifying database is clean...")
            response = requests.get(f"{base}/orders/public/all", timeout=15)
            if response.status_code == 200:
                remaining = response.json()
                if len(remaining) == 0:
                    print("✅ DATABASE CLEARED - 0 orders remaining")
                else:
                    print(f"⚠️  {len(remaining)} orders still in database")
        else:
            print("✅ Database already empty")
    else:
        print(f"❌ Failed to fetch orders: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("CLEANUP COMPLETE")
print("=" * 60)
print("\n📋 Next Steps:")
print("1. Open Admin Portal → Orders page")
print("2. Hard refresh browser (Ctrl + Shift + R)")
print("3. Should see '0 orders found'")
print("4. Clear browser localStorage:")
print("   - Press F12 → Console tab")
print("   - Type: localStorage.clear()")
print("   - Press Enter")
print("5. Refresh page again")
print("\nSystem is now clean and ready for testing! ✅")
