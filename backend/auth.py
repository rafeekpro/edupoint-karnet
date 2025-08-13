from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from models import User
from db_connection import db
import os
try:
    from models_v2 import UserResponse
    from db_v2 import db_v2
    use_v2 = True
except ImportError:
    use_v2 = False

# Get SECRET_KEY from environment variable with fallback for local development
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Try v2 database first
    if use_v2:
        user_dict = db_v2.get_user(int(user_id))
        if user_dict:
            # Convert v2 user to v1 User model for compatibility with /users/me endpoint
            from datetime import datetime
            return User(
                id=str(user_dict['id']),  # Convert int to string
                email=user_dict['email'],
                name=user_dict['name'],
                role=user_dict['role'],
                created_at=user_dict.get('created_at', datetime.now()).isoformat() if isinstance(user_dict.get('created_at'), datetime) else user_dict.get('created_at')
            )
    
    # Fallback to v1
    user = db.users.get(user_id)
    if user is None:
        raise credentials_exception
    return user

def authenticate_user(email: str, password: str) -> Optional[User]:
    user = db.get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user