from datetime import datetime
from sqlmodel import Field, SQLModel

class Arrest(SQLModel, table=True):
    arrest_date: datetime = Field(default=None, sa_column_kwargs={"nullable": True})
    arrest_boro: str = Field(default=None, sa_column_kwargs={"nullable": True})
    arrest_precinct: int = Field(default=None, sa_column_kwargs={"nullable": True})
    x_coord_cd: float = Field(default=None, sa_column_kwargs={"nullable": True})
    y_coord_cd: float = Field(default=None, sa_column_kwargs={"nullable": True})
    latitude: float = Field(default=None, sa_column_kwargs={"nullable": True})
    longitude: float = Field(default=None, sa_column_kwargs={"nullable": True})
