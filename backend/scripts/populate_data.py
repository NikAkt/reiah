import csv
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel, create_engine
from app.models.arrest import Arrest
from app.models.noise import Noise
from app.utils.database_setup import get_session, create_database_and_tables

DATABASE_URL = os.getenv("DATABASE_URL")

async def populate_table(file_path, model_class, session: AsyncSession):
    with open(file_path, mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            record = model_class(**row)
            session.add(record)
        await session.commit()

async def main():
    async with get_session() as session:
        await create_database_and_tables()
        await populate_table('data/processed/cleaned_arrest_data.csv', Arrest, session)
        await populate_table('data/processed/cleaned_noise_data.csv', Noise, session)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
