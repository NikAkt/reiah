# Python Imports
from datetime import datetime, timezone

# FastAPI Imports
from fastapi import APIRouter, Depends, HTTPException, status

# Auth Imports
from app.utils.password import create_password_hash
from app.crud.users import create_user, get_all, update_user_profile, get_user

# Database Imports
from app.utils.database_setup import get_session
from sqlalchemy.ext.asyncio import AsyncSession

# Models & Schemas
from app.models.users import User
from app.schemas.users import CreateUser, UpdateUser

# Utils imports

from app.utils.authentication import get_current_user

router = APIRouter()


@router.post("/register")
async def register_user(
    user_create: CreateUser, session: AsyncSession = Depends(get_session)
):
    user = await get_user(session, user_create.username)

    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

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


@router.get("/")
async def get_all_users(session: AsyncSession = Depends(get_session)):
    users = await get_all(session)
    return users


@router.patch("/{username}")
async def user_settings(
    username: str,
    update_user: UpdateUser,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    user = await get_user(session, username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist"
        )

    if current_user.username != username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Operation not permitted"
        )

    user.email = update_user.email if update_user.email else user.email
    user.updated_at = datetime.now(timezone.utc)

    await session.commit()
    await session.refresh(user)

    return user

