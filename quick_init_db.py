import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'smartrentals_mvp'))

from app.database import Base, engine
from app import models
from app.auth import get_password_hash
from sqlalchemy.orm import sessionmaker

# Create tables
Base.metadata.create_all(bind=engine)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Check if admin user exists
    existing_admin = db.query(models.User).filter(models.User.email == 'admin@smartrentals.com').first()
    if not existing_admin:
        # Create admin user
        admin_user = models.User(
            email='admin@smartrentals.com',
            password_hash=get_password_hash('admin123'),
            role='admin',
            first_name='Admin',
            last_name='User'
        )
        db.add(admin_user)
        print("Created admin user")

    # Create sample products if they don't already exist (no 'category' field in current schema)
    demo_products = [
        {"name": "CAT 320 Excavator", "sku": "EXC-CAT320-001", "description": "Heavy-duty excavator perfect for digging, trenching, and demolition.", "daily_rate": 350.0},
        {"name": "Mack Granite Dump Truck", "sku": "DMP-MACK-GRN-001", "description": "Reliable dump truck for hauling materials, debris, and aggregate.", "daily_rate": 420.0},
        {"name": "John Deere 410L Backhoe Loader", "sku": "BHL-JD-410L-001", "description": "Versatile backhoe loader combining loading and digging capabilities.", "daily_rate": 300.0},
        {"name": "CAT 950M Wheel Loader", "sku": "WHL-CAT950M-001", "description": "Powerful wheel loader designed for heavy material handling.", "daily_rate": 380.0},
        {"name": "Grove RT890E Rough Terrain Crane", "sku": "CRN-GRV-RT890E-001", "description": "90-ton rough terrain crane ideal for lifting and placement.", "daily_rate": 900.0},
        {"name": "CAT D6T Bulldozer", "sku": "BLD-CAT-D6T-001", "description": "Medium bulldozer perfect for earthmoving and site prep.", "daily_rate": 500.0},
    ]

    for p in demo_products:
        existing = db.query(models.Product).filter(models.Product.sku == p["sku"]).first()
        if not existing:
            product = models.Product(
                name=p["name"],
                sku=p["sku"],
                description=p["description"],
                daily_rate=p["daily_rate"],
            )
            db.add(product)
            db.flush()
            print(f"Created product: {product.name} ({product.sku})")
            # Create 2 inventory items for each new product
            for i in range(1, 3):
                item = models.InventoryItem(
                    product_id=product.id,
                    label=f"{product.sku}-UNIT-{i:02d}",
                    location="Main Yard",
                    active=True,
                )
                db.add(item)
            print(f"Added inventory items for {product.sku}")
        else:
            print(f"Product already exists: {existing.name} ({existing.sku})")

    if db.query(models.Customer).count() == 0:
        customer = models.Customer(
            name='John Doe',
            email='john@example.com',
            phone='555-1234',
        )
        db.add(customer)
        db.flush()
        print("Created sample customer")

    db.commit()
    print("Database initialization completed successfully!")
    print("Login with: admin@smartrentals.com / admin123")

except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()
