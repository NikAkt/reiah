from sqlmodel import SQLModel, Field
from datetime import datetime

class Arrest(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    ARREST_DATE: datetime
    ARREST_BORO: str
    ARREST_PRECINCT: int
    X_COORD_CD: float
    Y_COORD_CD: float
    Latitude: float
    Longitude: float
