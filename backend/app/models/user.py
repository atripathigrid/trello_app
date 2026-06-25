from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    
    # Relationships
    boards_owned = relationship("Board", back_populates="owner")
    boards_member = relationship("BoardMember", back_populates="user")
    tickets_assigned = relationship("Ticket", back_populates="assignee")
