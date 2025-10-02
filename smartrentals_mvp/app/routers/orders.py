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
    try:
        orders = db.query(models.Order).all()
        results = []
        for o in orders:
            try:
                meta = db.query(models.PublicOrderMeta).filter(models.PublicOrderMeta.order_id == o.id).first()
                row = {
                    "id": o.id,
                    "customer_id": o.customer_id,
                    "status": str(o.status) if o.status else "pending",
                    "created_at": o.created_at.isoformat() if o.created_at else None,
                    "subtotal": float(o.subtotal) if o.subtotal else 0.0,
                    "total": float(o.total) if o.total else 0.0,
                }
                if meta:
                    row.update({
                        "customer_info": {
                            "name": meta.customer_name or '',
                            "email": meta.customer_email or '',
                            "phone": meta.customer_phone or '',
                        },
                        "equipment_name": meta.equipment_name or '',
                        "payment_method": meta.payment_method or '',
                        "total_price": float(meta.total_price or 0.0),
                        "total_hours": float(meta.total_hours or 0.0),
                        "start_date": meta.start_date.isoformat() if meta.start_date else None,
                        "end_date": meta.end_date.isoformat() if meta.end_date else None,
                    })
                results.append(row)
            except Exception as e:
                print(f"Warning: Failed to process order {o.id}: {e}")
                continue
        return results
    except Exception as e:
        print(f"Error fetching orders: {e}")
        return []

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
    try:
        print(f"[ORDER CREATE] Received payload: {payload}")
        
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
            db.flush()  # Get customer ID without committing
            print(f"[ORDER CREATE] Created customer #{customer.id}")

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
        db.flush()  # Get order ID
        print(f"[ORDER CREATE] Created order #{order.id}")

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
        
        # Parse dates carefully
        from datetime import datetime as _dt
        sd = payload.get("start_date")
        ed = payload.get("end_date")
        if sd:
            try:
                meta.start_date = _dt.fromisoformat(sd.replace('Z', '+00:00'))
            except:
                pass
        if ed:
            try:
                meta.end_date = _dt.fromisoformat(ed.replace('Z', '+00:00'))
            except:
                pass

        db.add(meta)
        
        # COMMIT EVERYTHING AT ONCE
        db.commit()
        print(f"[ORDER CREATE] ✅ Successfully committed order #{order.id} to database")

        return {"id": order.id, "status": "created"}
    except Exception as e:
        print(f"[ORDER CREATE] ❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")


@router.put("/public/update/{order_id}")
async def public_update_order(order_id: int, payload: dict, db: Session = Depends(get_db)):
    """
    Update order status and optionally record a payment (Boss Feature #1: Auto-status on payment).
    Accepts keys: status, payment_details {paymentMethod, amount, transactionId}
    """
    order = db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    meta = db.query(models.PublicOrderMeta).filter(models.PublicOrderMeta.order_id == order.id).first()

    # Update basic status if provided
    status = payload.get("status")
    if status:
        order.status = status

    # Boss Feature #1: Auto-update status when payment completes
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

        # Auto-update to "paid_awaiting_delivery" or "paid_awaiting_pickup"
        delivery_method = payload.get("delivery_method", "pickup")
        if delivery_method == "delivery":
            order.status = "paid_awaiting_delivery"
        else:
            order.status = "paid_awaiting_pickup"

        # Update metadata
        if meta:
            meta.payment_method = str(method)
            meta.total_price = amt or meta.total_price

    db.commit()
    db.refresh(order)

    return {"ok": True, "order_id": order.id, "status": order.status}


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
