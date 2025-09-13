import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'smartrentals_mvp'))

from app.database import get_db
from app import models, schemas, auth
from sqlalchemy.orm import Session

# Get database session
db_session = next(get_db())

# Check if admin user exists
admin_user = db_session.query(models.User).filter(models.User.email == 'admin@smartrentals.com').first()

if admin_user:
    print('Admin user found:', admin_user.email, 'Role:', admin_user.role)
    print('Password hash:', admin_user.password_hash[:20] + '...')
else:
    print('Admin user not found, creating...')
    
    # Create admin user
    hashed_password = auth.get_password_hash('admin123')
    admin_user = models.User(
        email='admin@smartrentals.com',
        password_hash=hashed_password,
        role=models.UserRole.admin.value
    )
    db_session.add(admin_user)
    db_session.commit()
    db_session.refresh(admin_user)
    print('Admin user created successfully:', admin_user.email)

print('Admin user setup completed!')