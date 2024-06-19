from pydantic import BaseModel, EmailStr
from typing import Optional


class CreateUser(BaseModel):
    username: str
    email: str
    password: str


class UpdateUser(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None