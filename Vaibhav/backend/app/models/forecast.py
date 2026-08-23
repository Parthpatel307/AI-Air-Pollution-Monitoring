from datetime import datetime

from pydantic import BaseModel


class ForecastRecord(BaseModel):
    zone_id: str
    timestamp: datetime
    predicted_aqi: float
    risk_level: str
    confidence: float