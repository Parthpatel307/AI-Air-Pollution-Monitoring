"""Citizen report schemas."""

from datetime import datetime

from pydantic import BaseModel


class CitizenReportCreate(BaseModel):
    title: str
    description: str
    zone_id: str
    latitude: float
    longitude: float
    category: str


class CitizenReportResponse(BaseModel):
    report_id: str
    title: str
    description: str
    zone_id: str
    latitude: float
    longitude: float
    category: str
    status: str
    created_at: datetime