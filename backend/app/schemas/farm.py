from pydantic import BaseModel, Field


class FarmBoundaryRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    boundary: dict


class FarmAreaResponse(BaseModel):
    name: str
    area_hectare: float
    boundary: dict