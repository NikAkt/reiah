from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session
from app.models import User
from app.endpoints.auth import get_password_hash, get_user
import logging

router = APIRouter()
logging.basicConfig(level=logging.DEBUG)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

@router.post("/register", response_model=User)
async def register_user(user_create: UserCreate, session: AsyncSession = Depends(get_session)):
    logging.debug("Received request to register user: %s", user_create.username)
    
    user = await get_user(session, user_create.username)
    if user:
        logging.debug("Username already registered: %s", user_create.username)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")

    hashed_password = get_password_hash(user_create.password)
    now = datetime.now(timezone.utc)
    logging.debug("Current datetime: %s", now)
    
    new_user = User(
        username=user_create.username,
        email=user_create.email,
        password_hash=hashed_password,
        created_at=now,
        updated_at=now
    )
    
    logging.debug("New user object: %s", new_user)
    
    session.add(new_user)
    try:
        await session.commit()
        await session.refresh(new_user)
        logging.debug("User registered successfully: %s", new_user.username)
        return new_user
    except Exception as e:
        logging.error("Error during user registration: %s", str(e))
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")
