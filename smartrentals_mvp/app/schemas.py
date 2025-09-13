from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

# Authentication schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    daily_rate: float = 0.0
    hourly_rate: float = 0.0
    sku: str
    image_url: Optional[str] = ""
    category: Optional[str] = ""
    published: Optional[bool] = True
    min_hours: Optional[int] = 1
    max_hours: Optional[int] = None

class ProductOut(ProductCreate):
    id: int
    class Config:
        from_attributes = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    daily_rate: Optional[float] = None
    hourly_rate: Optional[float] = None
    sku: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    published: Optional[bool] = None
    min_hours: Optional[int] = None
    max_hours: Optional[int] = None

class InventoryItemCreate(BaseModel):
    product_id: int
    label: str
    location: str = ""
    active: bool = True

class InventoryItemOut(InventoryItemCreate):
    id: int
    class Config:
        from_attributes = True

class InventoryItemUpdate(BaseModel):
    label: Optional[str] = None
    location: Optional[str] = None
    active: Optional[bool] = None

class CustomerCreate(BaseModel):
    name: str
    phone: str

class CustomerOut(CustomerCreate):
    id: int
    class Config:
        from_attributes = True

class ReservationCreate(BaseModel):
    inventory_item_id: int
    start_date: datetime
    end_date: datetime

class OrderCreate(BaseModel):
    reservations: List[ReservationCreate]

class OrderOut(BaseModel):
    id: int
    customer_id: int
    status: str
    created_at: datetime
    subtotal: float
    total: float
    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    order_id: int
    method: str
    amount: float
    reference: str

class PaymentOut(PaymentCreate):
    id: int
    class Config:
        from_attributes = True

class AvailabilityQuery(BaseModel):
    start_date: datetime
    end_date: datetime

class AvailableItem(BaseModel):
    id: int
    product_id: int
    label: str
    location: str
    active: bool
    class Config:
        from_attributes = True

class QuoteRequest(BaseModel):
    reservations: List[ReservationCreate]

class QuoteOut(BaseModel):
    subtotal: float
    total: float
