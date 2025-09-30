from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..utils import is_available, calculate_reservations_total, rental_hours
from ..auth import get_current_active_user, get_staff_or_admin_user

router = APIRouter(prefix="/orders", tags=["orders"]) 


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
    """Admin/Staff endpoint to list all orders (requires authentication)"""
    return db.query(models.Order).all()

@router.get("/public/all", response_model=list[schemas.OrderOut])
async def list_all_orders_public(db: Session = Depends(get_db)):
    """Public endpoint to list all orders (NO AUTH - for demo/testing only)"""
    return db.query(models.Order).all()

# ---------------------------
# Public demo endpoints (no auth)
# ---------------------------

@router.post("/public/create-simple")
async def public_create_simple_order(payload: dict, db: Session = Depends(get_db)):
    """
    Create a minimal order without authentication for demo purposes.
    Expected payload keys (all optional, best-effort):
    - name, phone, email
    - total_price (float), payment_method (str)
    - equipment_name (str)
    - start_date (str/datetime), end_date (str/datetime), total_hours (float)
    """
    # Find or create a customer by phone/email/name
    name = payload.get("name") or payload.get("customer_name") or "Walk-in Customer"
    phone = payload.get("phone") or "unknown"
    email = payload.get("email") or f"guest_{phone}@example.com"

    customer = (
        db.query(models.Customer)
        .filter(models.Customer.phone == phone)
        .first()
    )
    if not customer:
        customer = models.Customer(name=name, email=email, phone=phone)
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # Create a very simple order
    order = models.Order(customer_id=customer.id)
    # Totals
    try:
        total = float(payload.get("total_price") or payload.get("total") or 0.0)
    except Exception:
        total = 0.0
    order.subtotal = total
    order.total = total

    db.add(order)
    db.commit()
    db.refresh(order)

    return {"id": order.id}


@router.put("/public/update/{order_id}")
async def public_update_order(order_id: int, payload: dict, db: Session = Depends(get_db)):
    """
    Update order status and optionally record a payment, without auth (demo only).
    Accepts keys: status, payment_status, delivery_status, payment_details {paymentMethod, amount, transactionId}
    """
    order = db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Update basic status if provided
    status = payload.get("status")
    if status:
        order.status = status

    # Record payment if provided
    details = payload.get("payment_details") or {}
    method = details.get("paymentMethod") or payload.get("payment_method")
    amount = details.get("amount") or payload.get("amount")
    reference = details.get("transactionId") or payload.get("transactionId")

    if method and amount is not None and reference:
        try:
            amt = float(amount)
        except Exception:
            amt = 0.0
        payment = models.Payment(order_id=order.id, method=str(method), amount=amt, reference=str(reference))
        db.add(payment)

    db.commit()
    db.refresh(order)

    return {"ok": True, "order_id": order.id}
