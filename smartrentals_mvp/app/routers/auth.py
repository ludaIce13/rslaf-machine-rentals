from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..database import get_db
from .. import models, schemas, auth
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=schemas.UserOut)
async def register_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user and create customer profile"""
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    hashed_password = auth.get_password_hash(user_data.password)
    user = models.User(
        email=user_data.email,
        password_hash=hashed_password,
        role=models.UserRole.customer.value
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create customer profile
    customer = models.Customer(
        user_id=user.id,
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone
    )
    db.add(customer)
    db.commit()

    return user

@router.post("/login", response_model=schemas.Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate user and return JWT token (Form data)"""
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/json", response_model=schemas.Token)
async def login_user_json(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token (JSON data)"""
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not auth.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
async def get_current_user_info(current_user: models.User = Depends(auth.get_current_active_user)):
    """Get current user information"""
    return current_user

@router.put("/me", response_model=schemas.UserOut)
async def update_user_profile(
    user_update: schemas.UserCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    # Check if email is being changed and if it's already taken
    if user_update.email != current_user.email:
        existing_user = db.query(models.User).filter(models.User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use")

    # Update user
    current_user.email = user_update.email
    if user_update.password:
        current_user.password_hash = auth.get_password_hash(user_update.password)

    # Update customer profile
    if current_user.customer_profile:
        current_user.customer_profile.name = user_update.name
        current_user.customer_profile.email = user_update.email
        current_user.customer_profile.phone = user_update.phone

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/admin/users", response_model=schemas.UserOut)
async def create_admin_user(
    user_data: schemas.UserCreate,
    admin_user: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to create users with specific roles"""
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user with admin role
    hashed_password = auth.get_password_hash(user_data.password)
    user = models.User(
        email=user_data.email,
        password_hash=hashed_password,
        role=models.UserRole.admin.value
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@router.get("/admin/users", response_model=list[schemas.UserOut])
async def list_all_users(
    admin_user: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to list all users"""
    users = db.query(models.User).all()
    return users

@router.put("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role: str,
    admin_user: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to update user role"""
    if role not in [r.value for r in models.UserRole]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role
    db.commit()
    return {"message": f"User role updated to {role}"}

@router.delete("/admin/users/{user_id}")
async def deactivate_user(
    user_id: int,
    admin_user: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to deactivate a user"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}