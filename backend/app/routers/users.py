# Python Imports
from datetime import datetime, timezone

# FastAPI Imports
from fastapi import APIRouter, Depends, HTTPException

# Auth Imports
from app.crud.users import create_user
from app.utils.authentication import create_password_hash, get_user

# Database Imports
from app.database import get_session
from sqlalchemy.ext.asyncio import AsyncSession

# Models & Schemas
from app.models.users import User
from app.schemas.users import CreateUser

router = APIRouter()


@router.post("/register", response_model=CreateUser)
async def register_user(
    user_create: CreateUser, session: AsyncSession = Depends(get_session)
):
    user_or_error = await get_user(session, user_create.username)

    if isinstance(user_or_error, HTTPException):
        raise user_or_error

    new_user = User(
        username=user_create.username,
        email=user_create.email,
        password_hash=create_password_hash(user_create.password),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    new_user_or_error = await create_user(session, new_user)

    if isinstance(new_user_or_error, HTTPException):
        raise new_user_or_error
    else:
        return user_create
