# app/database.py
import logging
from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.models import User
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    logger.info("Starting database initialization...")
    async with engine.begin() as conn:
        logger.info("Creating database tables...")
        logger.info(f"Tables to create: {SQLModel.metadata.tables.keys()}")
        await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("Database tables created.")
    logger.info("Database initialization complete.")
