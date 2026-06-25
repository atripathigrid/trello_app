from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

BCRYPT_MAX_PASSWORD_BYTES = 72

def _bcrypt_password(password: str) -> str:
    """Return a bcrypt-safe password truncated to its 72-byte UTF-8 limit."""
    password_bytes = password.encode("utf-8")
    if len(password_bytes) <= BCRYPT_MAX_PASSWORD_BYTES:
        return password
    return password_bytes[:BCRYPT_MAX_PASSWORD_BYTES].decode("utf-8", errors="ignore")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies if the provided plain password matches the hashed password."""
    return pwd_context.verify(_bcrypt_password(plain_password), hashed_password)

def get_password_hash(password: str) -> str:
    """Generates a bcrypt hash for the provided password."""
    return pwd_context.hash(_bcrypt_password(password))

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    """Creates a JWT access token for the given subject (user ID)."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
