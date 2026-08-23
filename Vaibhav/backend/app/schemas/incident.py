"""Incident schemas."""

from datetime import datetime

from pydantic import BaseModel


class IncidentResponse(BaseModel):
    incident_id: str
    title: str
    severity: str
    zone_id: str
    status: str
    created_at: datetime


class IncidentDetailResponse(BaseModel):
    incident_id: str
    title: str
    severity: str
    zone_id: str
    status: str
    created_at: datetime


class IncidentActionRequest(BaseModel):
    action: str
    notes: str


class IncidentActionData(BaseModel):
    incident_id: str
    action_id: str
    status: str


class IncidentActionResponse(BaseModel):
    success: bool
    data: IncidentActionData
