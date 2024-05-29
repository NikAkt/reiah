from typing import Optional, Union

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.users import User


async def get_user(db_session: AsyncSession, username: str) -> Optional[User]:
    """Gets a user by username from the database if they exist"""
    user = await db_session.get(User, username)

    if user:
        return user

    return None


async def get_all(db_session: AsyncSession):
    """Gets All the users from the user database"""
    statement = select(User)
    users = await db_session.execute(statement)
    return users.scalars().all()


async def create_user(
    db_session: AsyncSession, new_user: User
) -> Union[User, HTTPException]:

    try:

        db_session.add(new_user)

        await db_session.commit()

        await db_session.refresh(new_user)

        return new_user
    except Exception as e:
        await db_session.rollback()

        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User already exists",
        )
