# app/main.py
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import create_database_and_tables

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_database_and_tables()

    logger.info("startup: triggered")

    yield

    logger.info("shutdown: triggered")


app = FastAPI(lifespan=lifespan)


@app.get("/")
async def read_root():
    return {"message": "Welcome to Real Estate Advisor (Summer project)"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
