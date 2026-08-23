"""Hotspot schemas."""

from datetime import datetime

from pydantic import BaseModel


class HotspotResponse(BaseModel):
    hotspot_id: str
    zone_id: str
    zone_name: str
    latitude: float
    longitude: float
    aqi: float
    severity: str
    detected_at: datetime