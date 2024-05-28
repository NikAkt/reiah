from typing import Annotated, Optional
from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import jwt
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from pydantic import BaseModel


# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Set up the fast api Application
app = FastAPI()
templates = Jinja2Templates("templates")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --------------------------------------------------------------------- FAKE DATABASE SECTION -------------------------


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


# This is a model that is being used by our fake DB for the shape of the User Model
# It includes username, email a full name and a disabled booelan which tells us if a user is disabled
class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None


# This is the model of a user in a db so it is basically the User model plus a hashed password
class UserInDB(User):
    hashed_password: str


fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
    },
    "alice": {
        "username": "alice",
        "full_name": "Alice Wonderson",
        "email": "alice@example.com",
        "hashed_password": "fakehashedsecret2",
        "disabled": True,
    },
}


# a function which creates fake password hashes
def fake_hash_password(password: str):
    return "fakehashed" + password


# THIS WOULD FETCH A USER FROM A DATABSE AND RETURN A USER IF THEY EXIST
# this function takes a db and a username and then tries to find that username in the database
# If its there then return a UserInDB object
def get_user(db, username: str) -> Optional[UserInDB]:
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)


# --------------------------------------------------------------------- AUTH SECTION -------------------------


# This function uses the crypt context to verify the plain text password when hashed matches the hashed password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# this function returns a hash for a given plain text password
def get_password_hash(password):
    return pwd_context.hash(password)


# A fake password bearer that takes a token URL and then uses that for oauth requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# THIS FUNCTION IN ACTUALITY WOULD DECODE A TOKEN (JSON WEB TOKEN MOST LIKELY) INTO A USERNAME THAT CAN BE QUERIED IN THE DATABASE
# this function is a fake token decoder it takes a token and finds a user with that fake token
def fake_decode_token(token) -> Optional[UserInDB]:
    # This doesn't provide any security at all
    # Check the next version
    user = get_user(fake_users_db, token)
    return user


# Using the fake user and the password
# This function gets the user if they exists
# then verifies the password passed is matching the hash when hashed
def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


# this function creates an access token (JWT Token)
# How it creates one is it takes data which is a dictionary
# it encodes the data passed in and the expiry using the secret key and algorithm and returns a JWT
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response
) -> Token:
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="Bearer")


# this async function gets a current user by taking a token
# decoding that token in to a user
# if the user is None then it raises an exception since theres invalid credentials which returns as that error
# else returns the user found
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
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
    except InvalidTokenError:
        raise credentials_exception

    user = get_user(
        fake_users_db, username=token_data.username if token_data.username else ""
    )
    if user is None:
        raise credentials_exception
    return user


# --------------------------------------------------------------------- API SECTION -------------------------


# this the function which is dependent on getting the user
# if it finds a user but the user is disabled raise a inactive user error
# else return the current user
async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User | HTTPException:
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@app.get("/users/me")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return current_user


# Okay so the flow goes like this
# 1. I request the endpoint of /users/me
# 2. It depends on the get_current_active_user function which itself depends on the get_current_user function
# 3. the get_current_user function depends on the oauth2_scheme
#   - I think under the hood how this works is it attempts to get the token from the request header if so it tries to then execute the token decoder
# 4. If the user is not logges in or does not exist (EG NO TOKEN) then it will raise an exception
# 5. To login we post a username and password to the token endpoint similar to a login endpoint which gives us a token that would normally be saved as a cookie but in this case just gives us the value


@app.get("/", response_class=HTMLResponse)
async def homepage(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
