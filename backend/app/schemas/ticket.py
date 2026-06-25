from pydantic import BaseModel
from typing import Optional

class TicketBase(BaseModel):
    name: str
    description: Optional[str] = None
    assignee_id: Optional[int] = None

class TicketCreate(TicketBase):
    pass

class TicketUpdate(TicketBase):
    name: Optional[str] = None
    section_id: Optional[int] = None

class TicketResponse(TicketBase):
    id: int
    section_id: int

    model_config = {"from_attributes": True}
