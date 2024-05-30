from pydantic import BaseModel, EmailStr
from typing import Optional

class CreateUser(BaseModel):
    username: str
    email: str
    password: str

class UpdateUser(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None