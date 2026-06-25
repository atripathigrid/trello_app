from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Board(Base):
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="boards_owned")
    members = relationship("BoardMember", back_populates="board", cascade="all, delete-orphan")
    sections = relationship("Section", back_populates="board", cascade="all, delete-orphan")
    invites = relationship("InviteToken", back_populates="board", cascade="all, delete-orphan")


class BoardMember(Base):
    __tablename__ = "board_members"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    board = relationship("Board", back_populates="members")
    user = relationship("User", back_populates="boards_member")
