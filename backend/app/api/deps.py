from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.services.user_service import get_user_by_email
from sqlalchemy.future import select

oauth2_scheme = HTTPBearer()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get a database session."""
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_user(
    db: AsyncSession = Depends(get_db), token_attr: HTTPAuthorizationCredentials = Depends(oauth2_scheme)
) -> User:
    token = token_attr.credentials
    """Dependency to get the current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user
