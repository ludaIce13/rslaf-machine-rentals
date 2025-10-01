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

@router.get("/public/all")
async def list_all_orders_public(db: Session = Depends(get_db)):
    """Public endpoint to list all orders (NO AUTH) with display metadata merged in."""
    orders = db.query(models.Order).all()
    # Build a merged list preserving extra fields for the admin UI
    results = []
    for o in orders:
        meta = db.query(models.PublicOrderMeta).filter(models.PublicOrderMeta.order_id == o.id).first()
        row = {
            "id": o.id,
            "customer_id": o.customer_id,
            "status": o.status,
            "created_at": o.created_at,
            "subtotal": o.subtotal,
            "total": o.total,
        }
        if meta:
            row.update({
                "customer_info": {
                    "name": getattr(meta, 'customer_name', ''),
                    "email": getattr(meta, 'customer_email', ''),
                    "phone": getattr(meta, 'customer_phone', ''),
                },
                "equipment_name": getattr(meta, 'equipment_name', ''),
                "payment_method": getattr(meta, 'payment_method', ''),
                "total_price": getattr(meta, 'total_price', 0.0),
                "total_hours": getattr(meta, 'total_hours', 0.0),
                "start_date": getattr(meta, 'start_date', None),
                "end_date": getattr(meta, 'end_date', None),
                # Rental tracking (gracefully handle if columns don't exist yet)
                "delivery_method": getattr(meta, 'delivery_method', 'pickup'),
                "delivery_pickup_time": getattr(meta, 'delivery_pickup_time', None),
                "expected_return_time": getattr(meta, 'expected_return_time', None),
                "actual_return_time": getattr(meta, 'actual_return_time', None),
                "is_late_delivery": getattr(meta, 'is_late_delivery', False),
                "is_late_return": getattr(meta, 'is_late_return', False),
                "extra_billing_hours": getattr(meta, 'extra_billing_hours', 0.0),
            })
        results.append(row)
    return results

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

    # Store demo/public metadata for admin display
    meta = models.PublicOrderMeta(
        order_id=order.id,
        customer_name=name,
        customer_email=email,
        customer_phone=phone,
        equipment_name=str(payload.get("equipment_name") or ""),
        payment_method=str(payload.get("payment_method") or ""),
        total_price=total,
        total_hours=float(payload.get("total_hours") or 0.0),
    )
    # Attempt to parse dates if provided (ISO strings recommended)
    try:
        from datetime import datetime as _dt
        sd = payload.get("start_date")
        ed = payload.get("end_date")
        meta.start_date = _dt.fromisoformat(sd) if sd else None
        meta.end_date = _dt.fromisoformat(ed) if ed else None
    except Exception:
        pass

    db.add(meta)
    db.commit()

    return {"id": order.id}


@router.put("/public/update/{order_id}")
async def public_update_order(order_id: int, payload: dict, db: Session = Depends(get_db)):
    """
    Update order status and optionally record a payment, without auth (demo only).
    Accepts keys: status, payment_status, delivery_status, payment_details {paymentMethod, amount, transactionId}
    Also handles rental tracking: delivery_method, delivery_pickup_time, expected_return_time
    """
    from datetime import datetime, timedelta
    
    order = db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    meta = db.query(models.PublicOrderMeta).filter(models.PublicOrderMeta.order_id == order.id).first()

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

        # Auto-update status to "Paid / Awaiting Delivery" or "Paid / Awaiting Pickup"
        delivery_method = getattr(meta, 'delivery_method', 'pickup') if meta else 'pickup'
        if delivery_method == "delivery":
            order.status = "paid_awaiting_delivery"
        else:
            order.status = "paid_awaiting_pickup"

        # Update public metadata with latest totals/method
        if meta:
            if method:
                meta.payment_method = str(method)
            if amount is not None:
                meta.total_price = amt or meta.total_price

    # Handle delivery/pickup tracking (safely check if attributes exist)
    if payload.get("delivery_method") and meta:
        try:
            meta.delivery_method = payload.get("delivery_method")
        except AttributeError:
            pass  # Column doesn't exist yet
    
    if payload.get("mark_delivered_or_picked_up") and meta:
        try:
            # Mark as delivered/picked up - rental time starts NOW
            meta.delivery_pickup_time = datetime.utcnow()
            
            # Calculate expected return time based on rental hours
            if getattr(meta, 'total_hours', 0) and meta.total_hours > 0:
                meta.expected_return_time = datetime.utcnow() + timedelta(hours=meta.total_hours)
            elif getattr(meta, 'start_date', None) and getattr(meta, 'end_date', None):
                meta.expected_return_time = meta.end_date
            
            # Update order status
            order.status = "rented"
            
            # Check if delivery was late
            if getattr(meta, 'expected_delivery_time', None) and datetime.utcnow() > meta.expected_delivery_time:
                meta.is_late_delivery = True
        except AttributeError:
            pass  # Columns don't exist yet
    
    # Handle return tracking
    if payload.get("mark_returned") and meta:
        try:
            meta.actual_return_time = datetime.utcnow()
            order.status = "returned"
            
            # Calculate extra billing if return is late
            expected = getattr(meta, 'expected_return_time', None)
            actual = getattr(meta, 'actual_return_time', None)
            if expected and actual and actual > expected:
                meta.is_late_return = True
                late_delta = actual - expected
                meta.extra_billing_hours = late_delta.total_seconds() / 3600.0
        except AttributeError:
            pass  # Columns don't exist yet
    
    # Set expected delivery time if provided
    if payload.get("expected_delivery_time") and meta:
        try:
            from datetime import datetime as _dt
            edt = payload.get("expected_delivery_time")
            meta.expected_delivery_time = _dt.fromisoformat(edt) if isinstance(edt, str) else edt
        except (AttributeError, Exception):
            pass  # Column doesn't exist yet or invalid format

    db.commit()
    db.refresh(order)

    return {"ok": True, "order_id": order.id}


@router.delete("/public/{order_id}")
async def public_delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete a single order and its related records (demo/public)."""
    order = db.query(models.Order).get(order_id)
    if not order:
        # Idempotent delete
        return {"ok": True, "deleted": 0}

    # Delete metadata
    db.query(models.PublicOrderMeta).filter(models.PublicOrderMeta.order_id == order_id).delete()
    # Delete payments
    db.query(models.Payment).filter(models.Payment.order_id == order_id).delete()
    # Delete reservations
    db.query(models.Reservation).filter(models.Reservation.order_id == order_id).delete()
    # Delete order
    db.delete(order)
    db.commit()
    return {"ok": True, "deleted": 1}


@router.delete("/public/all")
async def public_delete_all_orders(db: Session = Depends(get_db)):
    """Dangerous: delete all orders and related rows (demo reset)."""
    # Delete in dependency order
    db.query(models.PublicOrderMeta).delete()
    db.query(models.Payment).delete()
    db.query(models.Reservation).delete()
    db.query(models.Order).delete()
    db.commit()
    return {"ok": True}


@router.get("/public/check-late-returns")
async def check_late_returns(customer_phone: str = None, db: Session = Depends(get_db)):
    """
    Check for active rentals that are past their expected return time.
    Returns list of late rentals for customer portal warnings.
    """
    from datetime import datetime
    
    # Query orders with status 'rented' where expected_return_time has passed
    late_rentals = []
    
    query = db.query(models.Order, models.PublicOrderMeta).join(
        models.PublicOrderMeta, models.Order.id == models.PublicOrderMeta.order_id
    ).filter(
        models.Order.status == "rented",
        models.PublicOrderMeta.expected_return_time.isnot(None)
    )
    
    if customer_phone:
        query = query.filter(models.PublicOrderMeta.customer_phone == customer_phone)
    
    results = query.all()
    
    for order, meta in results:
        if meta.expected_return_time and datetime.utcnow() > meta.expected_return_time:
            # Calculate extra hours
            late_delta = datetime.utcnow() - meta.expected_return_time
            extra_hours = late_delta.total_seconds() / 3600.0
            
            late_rentals.append({
                "order_id": order.id,
                "equipment_name": meta.equipment_name,
                "expected_return_time": meta.expected_return_time,
                "hours_overdue": round(extra_hours, 2),
                "customer_name": meta.customer_name,
                "customer_phone": meta.customer_phone,
                "total_price": meta.total_price,
                "total_hours": meta.total_hours,
            })
    
    return {"late_rentals": late_rentals, "count": len(late_rentals)}
