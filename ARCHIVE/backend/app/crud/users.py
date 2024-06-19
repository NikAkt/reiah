from typing import Optional, Union
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.users import User
from app.schemas.users import UpdateUser
from app.utils.password import verify_password, create_password_hash


async def get_user(session: AsyncSession, username: str) -> Optional[User]:
    result = await session.execute(select(User).where(User.username == username))
    return result.scalars().first()


async def get_all(db_session: AsyncSession):
    """Gets All the users from the user database"""
    statement = select(User)
    users = await db_session.execute(statement)
    return users.scalars().all()


async def create_user(db_session: AsyncSession, new_user: User) -> Union[User, HTTPException]:
    try:
        db_session.add(new_user)
        await db_session.commit()
        await db_session.refresh(new_user)
        return new_user
    except Exception:
        await db_session.rollback()

        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User already exists",
        )


async def update_user_profile(session: AsyncSession, username: str, user_update: UpdateUser) -> User:
    result = await session.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.email = user_update.email
    user.updated_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(user)
    return user
