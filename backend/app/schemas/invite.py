from pydantic import BaseModel
from datetime import datetime

class InviteCreateResponse(BaseModel):
    token_uuid: str
    expires_at: datetime
    board_id: int

    model_config = {"from_attributes": True}

class InviteJoinResponse(BaseModel):
    message: str
    board_id: int

class InviteResponse(BaseModel):
    token_uuid: str
    expires_at: datetime
    
    model_config = {"from_attributes": True}
