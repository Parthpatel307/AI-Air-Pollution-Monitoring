from pydantic import BaseModel


class ZoneCreate(BaseModel):
    zone_id: str
    name: str
    latitude: float
    longitude: float
    current_aqi: float
    risk_level: str


class ZoneResponse(BaseModel):
    zone_id: str
    name: str
    latitude: float
    longitude: float
    current_aqi: float
    risk_level: str