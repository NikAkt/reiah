from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_password_hash(plain_text_password: str) -> str:
    """This function takes a plain text password and returns a hash using the pwd_context"""
    return pwd_context.hash(plain_text_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """This will compare a plain text password when hashed with a hash to confirm it is the correct password"""
    return pwd_context.verify(plain_password, hashed_password)