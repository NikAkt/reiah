from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

# PYTHON IMPORTS
from typing import Annotated, Literal, Union
from datetime import datetime, timedelta, timezone

# FAST API IMPORTS
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.templating import Jinja2Templates

# AUTH IMPORTS
import jwt
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext

# CRUD IMPORTS
from app.crud.users import get_user

# MODELS
from app.models.users import User
from app.models.authentication import TokenData

# UTILS IMPORTS
from app.utils.database_setup import get_session
from app.utils.password import create_password_hash, verify_password


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"


# Set up the fast api Application
app = FastAPI()
templates = Jinja2Templates("templates")

# A fake password bearer that takes a token URL and then uses that for oauth requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def authenticate_user(session: AsyncSession, username: str, password: str) -> Union[User, bool]:
    result = await session.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if not user:
        print(f"User {username} not found")
        return False
    if not verify_password(password, user.password_hash):
        print(f"Password for user {username} does not match")
        return False
    return user


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    """This will encode the data and return a json web token with the data encoded in it"""
    copied_data = data.copy()

    if expires_delta:
        expire = (
            datetime.now(timezone.utc) + expires_delta
        )  # expire in delta t from now
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=15
        )  # if not included then 15 minutes from now will do

    copied_data.update({"exp": expire})  # Update the expiry date in the copied data

    encoded_jwt = jwt.encode(
        copied_data, SECRET_KEY, algorithm=ALGORITHM
    )  # Encode the data using the secret key and the algorithm decided

    # return the JSON Web Token
    return encoded_jwt


async def decode_user_details_from_token(token: Annotated[str, Depends(oauth2_scheme)]) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )  # exception if credentials do not match
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])  # decode the json web token
        username: str = payload.get("sub")  # get the username from the token
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception

    return token_data


async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception

    user = await get_user(session, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user
