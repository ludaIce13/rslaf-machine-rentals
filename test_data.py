from datetime import datetime, timedelta

test_products = [
    {
        "name": "Canon EOS R5",
        "description": "Professional mirrorless camera",
        "daily_rate": 99.99,
        "sku": "CANON-R5"
    },
    {
        "name": "Sony A7 IV",
        "description": "Full-frame mirrorless camera",
        "daily_rate": 89.99,
        "sku": "SONY-A7IV"
    },
    {
        "name": "DJI Mavic 3 Pro",
        "description": "Professional drone with 4K camera",
        "daily_rate": 149.99,
        "sku": "DJI-MAVIC3"
    },
]

test_inventory = [
    {"product_id": 1, "label": "CAN-001", "location": "Shelf A1", "active": True},
    {"product_id": 1, "label": "CAN-002", "location": "Shelf A1", "active": True},
    {"product_id": 2, "label": "SON-001", "location": "Shelf B2", "active": True},
    {"product_id": 3, "label": "DJI-001", "location": "Drone Cage", "active": True},
]

test_customers = [
    {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
    },
    {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "+1987654321"
    }
]

test_orders = [
    {
        "customer_id": 1,
        "status": "confirmed",
        "subtotal": 199.98,
        "total": 219.98,
        "reservations": [
            {
                "inventory_item_id": 1,
                "start_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
                "end_date": (datetime.utcnow() + timedelta(days=3)).isoformat(),
            }
        ],
        "payments": [
            {
                "method": "credit_card",
                "amount": 219.98,
                "reference": "PAY-12345"
            }
        ]
    }
]
