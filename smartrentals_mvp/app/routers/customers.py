from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_active_user, get_staff_or_admin_user

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("/me", response_model=schemas.CustomerOut)
async def get_my_customer_profile(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's customer profile"""
    if not current_user.customer_profile:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    return current_user.customer_profile

@router.put("/me", response_model=schemas.CustomerOut)
async def update_my_customer_profile(
    customer_update: schemas.CustomerCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user's customer profile"""
    if not current_user.customer_profile:
        raise HTTPException(status_code=404, detail="Customer profile not found")

    # Update customer profile
    for field, value in customer_update.dict().items():
        setattr(current_user.customer_profile, field, value)

    db.commit()
    db.refresh(current_user.customer_profile)
    return current_user.customer_profile

@router.post("", response_model=schemas.CustomerOut)
async def create_customer(
    payload: schemas.CustomerCreate,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Admin/Staff endpoint to create standalone customer profiles"""
    c = models.Customer(**payload.dict())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

@router.get("", response_model=list[schemas.CustomerOut])
async def list_customers(
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Admin/Staff endpoint to list all customers"""
    return db.query(models.Customer).all()

@router.get("/{customer_id}", response_model=schemas.CustomerOut)
async def get_customer(
    customer_id: int,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Admin/Staff endpoint to get specific customer"""
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer
