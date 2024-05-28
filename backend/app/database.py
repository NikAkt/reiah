# app/database.py
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine

# FOR CONFIG VARIABLES
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    engine = create_async_engine(DATABASE_URL, echo=True)


async def create_database_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
