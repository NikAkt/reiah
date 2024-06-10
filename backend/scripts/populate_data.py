import asyncio
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from app.models.arrest import Arrest
from app.models.noise import Noise
from app.utils.database_setup import engine, get_session

async def check_database():
    try:
        async with engine.connect() as conn:
            await conn.execute(select([1]))
        print("Database connection successful.")
    except Exception as e:
        print("Database connection failed:", str(e))

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Arrest.metadata.drop_all)
        await conn.run_sync(Noise.metadata.drop_all)
        await conn.run_sync(Arrest.metadata.create_all)
        await conn.run_sync(Noise.metadata.create_all)
    print("Tables dropped and recreated.")

def clean_row(row_dict):
    """Cleans and prepares the row for insertion."""
    try:
        row_dict['Created_Date'] = pd.to_datetime(row_dict['Created Date'], errors='coerce')
    except Exception as e:
        print(f"Skipping row due to date parsing error: {e}")
        return None

    # Ensure required fields are present and not NaN
    required_fields = ['Incident Zip', 'Borough', 'Latitude', 'Longitude']
    for field in required_fields:
        if pd.isna(row_dict.get(field)):
            print(f"Skipping row due to missing required fields: {row_dict}")
            return None

    # Renaming keys to match Noise model attributes
    row_dict['Incident_Zip'] = row_dict.pop('Incident Zip')
    return row_dict

async def populate_noise_data(session: AsyncSession):
    noise_data = pd.read_csv(
        '/app/data/processed/cleaned_noise_data.csv',
        dtype={'Incident Zip': 'float64', 'Borough': 'str', 'Latitude': 'float64', 'Longitude': 'float64'},
        keep_default_na=False
    )

    records_to_add = []

    for index, row in noise_data.iterrows():
        row_dict = row.to_dict()
        cleaned_row = clean_row(row_dict)

        if cleaned_row:
            records_to_add.append(Noise(**cleaned_row))

        if (index + 1) % 1000 == 0:
            try:
                session.add_all(records_to_add)
                await session.commit()
                records_to_add = []
                print(f"Inserted {index + 1} records into Noise table.")
            except Exception as e:
                print(f"Error inserting records at index {index}: {e}")
                await session.rollback()

    if records_to_add:
        try:
            session.add_all(records_to_add)
            await session.commit()
            print(f"Inserted remaining {len(records_to_add)} records into Noise table.")
        except Exception as e:
            print(f"Error inserting remaining records: {e}")
            await session.rollback()

async def populate_arrest_data(session: AsyncSession):
    arrest_data = pd.read_csv('/app/data/processed/cleaned_arrest_data.csv')
    records_to_add = []

    for index, row in arrest_data.iterrows():
        row_dict = row.to_dict()
        row_dict['ARREST_DATE'] = pd.to_datetime(row_dict['ARREST_DATE'], errors='coerce')
        records_to_add.append(Arrest(**row_dict))

        if (index + 1) % 1000 == 0:
            try:
                session.add_all(records_to_add)
                await session.commit()
                records_to_add = []
                print(f"Inserted {index + 1} records into Arrest table.")
            except Exception as e:
                print(f"Error inserting records at index {index}: {e}")
                await session.rollback()

    if records_to_add:
        try:
            session.add_all(records_to_add)
            await session.commit()
            print(f"Inserted remaining {len(records_to_add)} records into Arrest table.")
        except Exception as e:
            print(f"Error inserting remaining records: {e}")
            await session.rollback()

async def populate_data():
    async with get_session() as session:
        await populate_noise_data(session)
        await populate_arrest_data(session)

async def main():
    await check_database()
    await create_tables()
    await populate_data()

if __name__ == "__main__":
    asyncio.run(main())
