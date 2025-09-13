from sqlalchemy.orm import Session
from datetime import datetime
from . import models

def is_available(db: Session, inventory_item_id: int, start: datetime, end: datetime) -> bool:
    # Check for any overlapping reservation for this inventory item
    q = db.query(models.Reservation).filter(
        models.Reservation.inventory_item_id == inventory_item_id,
        models.Reservation.start_date < end,
        models.Reservation.end_date > start
    )
    return not db.query(q.exists()).scalar()

def available_inventory_items(db: Session, product_id: int, start: datetime, end: datetime) -> list[models.InventoryItem]:
    # Get active items for the product
    items_q = db.query(models.InventoryItem).filter(
        models.InventoryItem.product_id == product_id,
        models.InventoryItem.active == True
    )
    items = items_q.all()
    # Filter out items with overlapping reservations
    available = []
    for item in items:
        if is_available(db, item.id, start, end):
            available.append(item)
    return available

def rental_days(start: datetime, end: datetime) -> int:
    # Minimum of 1 day, count full days between start and end
    delta = end - start
    days = delta.days
    if delta.total_seconds() > 0 and days == 0:
        # any positive non-zero less than a day counts as 1 day for daily pricing
        return 1
    return max(1, days)

def rental_hours(start: datetime, end: datetime) -> int:
    # Round up to next whole hour; minimum 1 hour
    total_seconds = (end - start).total_seconds()
    if total_seconds <= 0:
        return 0
    hours = int((total_seconds + 3599) // 3600)  # ceiling division
    return max(1, hours)

def calculate_reservations_total(db: Session, reservations: list[models.Reservation]) -> float:
    total = 0.0
    for r in reservations:
        # Ensure product rate is loaded via inventory -> product
        product = r.inventory_item.product if r.inventory_item else None
        if product is None:
            # fetch explicitly if relationship not loaded
            inv = db.query(models.InventoryItem).get(r.inventory_item_id)
            product = db.query(models.Product).get(inv.product_id) if inv else None
        if product is None:
            continue
        # Prefer hourly pricing if defined and > 0, otherwise fallback to daily
        if (product.hourly_rate or 0) > 0:
            hours = rental_hours(r.start_date, r.end_date)
            total += product.hourly_rate * hours
        else:
            days = rental_days(r.start_date, r.end_date)
            total += product.daily_rate * days
    return round(total, 2)
