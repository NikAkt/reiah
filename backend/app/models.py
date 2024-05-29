from sqlmodel import SQLModel, Field
from sqlalchemy import Column, TIMESTAMP
from datetime import datetime, timezone

class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    username: str
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), sa_column=Column(TIMESTAMP(timezone=True), nullable=False, default=datetime.now(timezone.utc)))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), sa_column=Column(TIMESTAMP(timezone=True), nullable=False, default=datetime.now(timezone.utc)))
