from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    
    # Relationships
    board = relationship("Board", back_populates="sections")
    tickets = relationship("Ticket", back_populates="section", cascade="all, delete-orphan")
