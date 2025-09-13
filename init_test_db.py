import sys
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import models after setting up the path
from smartrentals_mvp.app.database import Base, engine
from smartrentals_mvp.app import models
from smartrentals_mvp.app.auth import get_password_hash
from test_data import test_products, test_inventory, test_customers, test_orders

def init_db():
    # Drop all tables and recreate them
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create admin user
        print("Creating admin user...")
        admin_user = models.User(
            email='admin@smartrentals.com',
            password_hash=get_password_hash('admin123'),
            role=models.UserRole.admin.value,
            first_name='Admin',
            last_name='User'
        )
        db.add(admin_user)
        db.flush()
        print(f"Admin user created: {admin_user.email}")
        
        # Create test products
        print("\nCreating test products...")
        for product_data in test_products:
            product = models.Product(**product_data)
            db.add(product)
            db.flush()
            print(f"Created product: {product.name} (SKU: {product.sku})")
        
        # Create inventory items
        print("\nCreating inventory items...")
        for item_data in test_inventory:
            item = models.InventoryItem(**item_data)
            db.add(item)
            db.flush()
            print(f"Created inventory item: {item.label}")
        
        # Create test customers
        print("\nCreating test customers...")
        for customer_data in test_customers:
            customer = models.Customer(**customer_data)
            db.add(customer)
            db.flush()
            print(f"Created customer: {customer.name} ({customer.email})")
        
        # Create test orders
        print("\nCreating test orders...")
        for order_data in test_orders:
            # Extract reservations and payments
            reservations_data = order_data.pop('reservations', [])
            payments_data = order_data.pop('payments', [])
            
            # Create order
            order = models.Order(**order_data)
            db.add(order)
            db.flush()
            
            # Add reservations
            for res_data in reservations_data:
                reservation = models.Reservation(order_id=order.id, **res_data)
                db.add(reservation)
            
            # Add payments
            for payment_data in payments_data:
                payment = models.Payment(order_id=order.id, **payment_data)
                db.add(payment)
            
            print(f"Created order #{order.id} for customer ID {order.customer_id}")
        
        # Commit all changes
        db.commit()
        print("\nDatabase initialization completed successfully!")
        
    except Exception as e:
        print(f"\nError initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting database initialization...")
    init_db()
    print("\nYou can now log in with:\nEmail: admin@smartrentals.com\nPassword: admin123")
