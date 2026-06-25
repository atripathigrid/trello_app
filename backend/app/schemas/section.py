from pydantic import BaseModel
from typing import Optional
from app.schemas.ticket import TicketResponse

# SECTION SCHEMAS
class SectionBase(BaseModel):
    name: str
    description: Optional[str] = None

class SectionCreate(SectionBase):
    pass

class SectionUpdate(SectionBase):
    name: Optional[str] = None

class SectionResponse(SectionBase):
    id: int
    board_id: int
    tickets: list[TicketResponse] = []

    model_config = {"from_attributes": True}
