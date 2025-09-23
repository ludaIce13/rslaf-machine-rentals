#!/usr/bin/env python3
"""
RSLAF Equipment Rental - Order Monitor
Real-time monitoring of new bookings and orders
"""

import sqlite3
import os
import time
from datetime import datetime
import json

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'smartrentals.db')
    return sqlite3.connect(db_path)

def format_currency(amount):
    """Format amount as currency"""
    try:
        return f"${float(amount):,.2f}"
    except:
        return str(amount)

def show_recent_orders(limit=10):
    """Show recent orders from database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get recent orders
        cursor.execute("""
            SELECT id, customer_name, equipment_name, total_price, 
                   status, start_date, end_date, created_at, payment_method
            FROM orders 
            ORDER BY created_at DESC 
            LIMIT ?
        """, (limit,))
        
        orders = cursor.fetchall()
        
        if not orders:
            print("📋 No orders found in database")
            return
            
        print(f"\n🎯 RECENT ORDERS (Last {len(orders)})")
        print("=" * 80)
        
        for order in orders:
            order_id, customer, equipment, price, status, start_date, end_date, created_at, payment_method = order
            
            # Format status with emoji
            status_emoji = {
                'pending': '⏳',
                'confirmed': '✅', 
                'paid': '💰',
                'completed': '🎉',
                'cancelled': '❌'
            }.get(status.lower(), '📝')
            
            print(f"\n🆔 Order #{order_id}")
            print(f"👤 Customer: {customer}")
            print(f"🚜 Equipment: {equipment}")
            print(f"💵 Price: {format_currency(price)}")
            print(f"{status_emoji} Status: {status.upper()}")
            print(f"💳 Payment: {payment_method or 'Not specified'}")
            print(f"📅 Period: {start_date} → {end_date}")
            print(f"🕒 Booked: {created_at}")
            print("-" * 50)
            
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

def show_order_stats():
    """Show order statistics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get order statistics
        cursor.execute("SELECT COUNT(*) FROM orders")
        total_orders = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'paid'")
        paid_orders = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'pending'")
        pending_orders = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(total_price) FROM orders WHERE status = 'paid'")
        total_revenue = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(DISTINCT customer_name) FROM orders")
        unique_customers = cursor.fetchone()[0]
        
        # Get payment method breakdown
        cursor.execute("""
            SELECT payment_method, COUNT(*) 
            FROM orders 
            WHERE payment_method IS NOT NULL 
            GROUP BY payment_method
        """)
        payment_methods = cursor.fetchall()
        
        print("\n📊 ORDER STATISTICS")
        print("=" * 40)
        print(f"📋 Total Orders: {total_orders}")
        print(f"💰 Paid Orders: {paid_orders}")
        print(f"⏳ Pending Orders: {pending_orders}")
        print(f"💵 Total Revenue: {format_currency(total_revenue)}")
        print(f"👥 Unique Customers: {unique_customers}")
        
        if payment_methods:
            print(f"\n💳 Payment Methods:")
            for method, count in payment_methods:
                print(f"  • {method}: {count} orders")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error getting stats: {e}")

def monitor_new_orders():
    """Monitor for new orders in real-time"""
    print("🔄 MONITORING NEW ORDERS (Press Ctrl+C to stop)")
    print("=" * 50)
    
    last_order_count = 0
    
    try:
        while True:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM orders")
            current_count = cursor.fetchone()[0]
            
            if current_count > last_order_count:
                new_orders = current_count - last_order_count
                print(f"\n🚨 {new_orders} NEW ORDER(S) DETECTED! [{datetime.now().strftime('%H:%M:%S')}]")
                
                # Show the new orders
                cursor.execute("""
                    SELECT id, customer_name, equipment_name, total_price, status, payment_method
                    FROM orders 
                    ORDER BY created_at DESC 
                    LIMIT ?
                """, (new_orders,))
                
                new_order_data = cursor.fetchall()
                for order in new_order_data:
                    order_id, customer, equipment, price, status, payment_method = order
                    print(f"  📝 Order #{order_id}: {customer} → {equipment} ({format_currency(price)}) [{status}]")
                
                last_order_count = current_count
            
            conn.close()
            time.sleep(5)  # Check every 5 seconds
            
    except KeyboardInterrupt:
        print("\n\n👋 Monitoring stopped by user")
    except Exception as e:
        print(f"\n❌ Monitoring error: {e}")

def main():
    """Main menu"""
    while True:
        print("\n" + "="*60)
        print("🎯 RSLAF EQUIPMENT RENTAL - DATABASE MONITOR")
        print("="*60)
        print("1. 📋 View Recent Orders")
        print("2. 📊 Show Order Statistics") 
        print("3. 🔄 Monitor New Orders (Real-time)")
        print("4. 🗄️ Inspect Full Database")
        print("5. 🚪 Exit")
        print("-"*60)
        
        choice = input("Choose an option (1-5): ").strip()
        
        if choice == '1':
            limit = input("How many recent orders to show? (default 10): ").strip()
            limit = int(limit) if limit.isdigit() else 10
            show_recent_orders(limit)
            
        elif choice == '2':
            show_order_stats()
            
        elif choice == '3':
            monitor_new_orders()
            
        elif choice == '4':
            print("\n🗄️ Running full database inspection...")
            os.system('python inspect_db.py')
            
        elif choice == '5':
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please try again.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()
