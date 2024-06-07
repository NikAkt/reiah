from datetime import datetime
from sqlmodel import Field, SQLModel

class Noise(SQLModel, table=True):
    created_date: datetime = Field(default=None, sa_column_kwargs={"nullable": True})
    incident_zip: float = Field(default=None, sa_column_kwargs={"nullable": True})
    incident_address: str = Field(default=None, sa_column_kwargs={"nullable": True})
    borough: str = Field(default=None, sa_column_kwargs={"nullable": True})
    latitude: float = Field(default=None, sa_column_kwargs={"nullable": True})
    longitude: float = Field(default=None, sa_column_kwargs={"nullable": True})
