from pydantic import BaseModel, EmailStr
from typing import Optional

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int

    model_config = {"from_attributes": True}

# Additional properties to return via API
class UserResponse(UserInDBBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str
