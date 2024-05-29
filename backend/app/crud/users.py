from typing import Literal, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.users import User


async def get_user(db_session: AsyncSession, username: str) -> User | HTTPException:
    """Gets a user by username from the database if they exist"""
    user = await db_session.get(User, username)
    if not user:
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    return user


async def create_user(
    db_session: AsyncSession, new_user: User
) -> Literal[True] | HTTPException:

    db_session.add(new_user)
    try:
        await db_session.commit()
        await db_session.refresh(new_user)
        return True
    except Exception as e:
        await db_session.rollback()
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User already exists {e}",
        )
