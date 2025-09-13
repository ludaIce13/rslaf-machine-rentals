from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import get_staff_or_admin_user

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("", response_model=schemas.PaymentOut)
def create_payment(payload: schemas.PaymentCreate, db: Session = Depends(get_db)):
    order = db.query(models.Order).get(payload.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    p = models.Payment(**payload.dict())
    db.add(p); db.commit(); db.refresh(p)
    return p
