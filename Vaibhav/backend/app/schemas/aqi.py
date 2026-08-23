from datetime import datetime

from pydantic import BaseModel


class AQICurrentResponse(BaseModel):
    zone_id: str
    zone_name: str
    aqi: float
    category: str
    pm25: float
    pm10: float
    no2: float
    so2: float
    co: float
    temperature: float
    humidity: float
    wind_speed: float
    timestamp: datetime


class AQIHistoryResponse(BaseModel):
    zone_id: str
    zone_name: str
    readings: list[AQICurrentResponse]