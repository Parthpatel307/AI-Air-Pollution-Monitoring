from datetime import datetime

from pydantic import BaseModel


class ForecastItem(BaseModel):
    timestamp: datetime
    predicted_aqi: float
    risk_level: str
    confidence: float


class ForecastResponse(BaseModel):
    zone_id: str
    forecast: list[ForecastItem]