from sqlmodel import SQLModel, Field
from datetime import datetime

class Noise(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    Created_Date: datetime
    Incident_Zip: float
    Borough: str
    Latitude: float
    Longitude: float
