import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'smartrentals_mvp'))

from app.database import get_db
from app import models, schemas, auth
from sqlalchemy.orm import Session

# Get database session
db_session = next(get_db())

def ensure_admin(email: str, password: str = 'admin123'):
    user = db_session.query(models.User).filter(models.User.email == email).first()
    if user:
        print('Admin user found:', user.email, 'Role:', user.role)
        return
    print('Admin user not found for', email, '- creating...')
    hashed_password = auth.get_password_hash(password)
    user = models.User(
        email=email,
        password_hash=hashed_password,
        role=models.UserRole.admin.value,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    print('Admin user created successfully:', user.email)

if __name__ == "__main__":
    # Ensure the production demo account exists
    ensure_admin('admin@rslaf.com')
    # Keep backward compatibility for older demo email if used
    ensure_admin('admin@smartrentals.com')
    print('Admin user setup completed!')