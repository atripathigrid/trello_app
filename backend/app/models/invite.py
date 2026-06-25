from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, timedelta
import uuid

def generate_uuid():
    return str(uuid.uuid4())

def default_expire():
    return datetime.utcnow() + timedelta(days=7)

class InviteToken(Base):
    __tablename__ = "invite_tokens"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    token_uuid = Column(String, default=generate_uuid, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, default=default_expire, nullable=False)
    
    # Relationships
    board = relationship("Board", back_populates="invites")
