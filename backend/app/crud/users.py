from typing import Optional
from app.models.users import User


def get_user(db, username: str) -> Optional[User]:
    """Gets a user by username from the database if they exist"""
    if username in db:
        user_dict = db[username]
        return User(**user_dict)
