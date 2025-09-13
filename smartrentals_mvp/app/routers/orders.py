from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from .. import models, schemas
from ..utils import is_available, calculate_reservations_total, rental_hours
from ..auth import get_current_active_user, get_staff_or_admin_user

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("", response_model=schemas.OrderOut)
async def create_order(
    payload: schemas.OrderCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create order for current authenticated user"""
    # Check if user has a customer profile
    if not current_user.customer_profile:
        raise HTTPException(status_code=400, detail="User must have a customer profile to create orders")

    # Basic availability check and constraints for each reservation request
    for r in payload.reservations:
        if r.end_date <= r.start_date:
            raise HTTPException(status_code=400, detail="Reservation end_date must be after start_date")
        if not is_available(db, r.inventory_item_id, r.start_date, r.end_date):
            raise HTTPException(status_code=409, detail=f"Item {r.inventory_item_id} not available for the selected period.")
        # Enforce product min/max hours if configured
        inv = db.query(models.InventoryItem).get(r.inventory_item_id)
        if not inv:
            raise HTTPException(status_code=404, detail=f"Inventory item {r.inventory_item_id} not found")
        product = db.query(models.Product).get(inv.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product for item {r.inventory_item_id} not found")
        hrs = rental_hours(r.start_date, r.end_date)
        if getattr(product, 'min_hours', None) and hrs < product.min_hours:
            raise HTTPException(status_code=400, detail=f"Minimum rental is {product.min_hours} hour(s)")
        if getattr(product, 'max_hours', None) and product.max_hours and hrs > product.max_hours:
            raise HTTPException(status_code=400, detail=f"Maximum rental is {product.max_hours} hour(s)")

    order = models.Order(customer_id=current_user.customer_profile.id)
    db.add(order)
    db.commit()
    db.refresh(order)

    # Create reservations
    for r in payload.reservations:
        res = models.Reservation(order_id=order.id, inventory_item_id=r.inventory_item_id, start_date=r.start_date, end_date=r.end_date)
        db.add(res)
    db.commit()

    # Reload reservations and compute totals
    reservations = db.query(models.Reservation).filter(models.Reservation.order_id == order.id).all()
    subtotal = calculate_reservations_total(db, reservations)
    order.subtotal = subtotal
    order.total = subtotal  # placeholder for taxes/fees/discounts
    db.commit()

    db.refresh(order)
    return order

@router.get("/my", response_model=list[schemas.OrderOut])
async def get_my_orders(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's orders"""
    if not current_user.customer_profile:
        return []

    return db.query(models.Order).filter(models.Order.customer_id == current_user.customer_profile.id).all()

@router.get("/{order_id}", response_model=schemas.OrderOut)
async def get_order(
    order_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific order (user can only access their own orders, staff/admin can access all)"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check if user can access this order
    if current_user.role not in ["admin", "staff"]:
        if not current_user.customer_profile or order.customer_id != current_user.customer_profile.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return order

@router.post("/{order_id}/status/{new_status}", response_model=schemas.OrderOut)
async def set_order_status(
    order_id: int,
    new_status: str,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Admin/Staff endpoint to update order status"""
    order = db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    allowed = {s.value for s in models.OrderStatus}
    if new_status not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {sorted(list(allowed))}")

    order.status = new_status
    db.commit()
    db.refresh(order)
    return order

@router.get("", response_model=list[schemas.OrderOut])
async def list_all_orders(
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Admin/Staff endpoint to list all orders"""
    return db.query(models.Order).all()
