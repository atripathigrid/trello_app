from pydantic import BaseModel
from typing import Optional
from app.schemas.section import SectionResponse
from app.schemas.user import UserResponse
from app.schemas.invite import InviteResponse

class BoardBase(BaseModel):
    name: str
    description: Optional[str] = None

class BoardCreate(BoardBase):
    pass

class BoardUpdate(BoardBase):
    name: Optional[str] = None

class BoardResponse(BoardBase):
    id: int
    owner_id: int

    model_config = {"from_attributes": True}

class BoardDetailResponse(BoardResponse):
    sections: list[SectionResponse] = []
    members: list[UserResponse] = []
    invites: list[InviteResponse] = []
