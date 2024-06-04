# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.utils.database_setup import create_database_and_tables
from app.routers import users
from app.endpoints import auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_database_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users")


@app.get("/")
async def read_root():
    return {"message": "Welcome to Real Estate Advisor (Summer project)"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
