from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Create async engine for PostgreSQL
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True, # Set to False in production
)

# AsyncSessionLocal is a factory for creating async sessions
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for declarative models
Base = declarative_base()
