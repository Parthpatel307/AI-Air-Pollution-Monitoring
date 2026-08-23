"""Alert schemas."""

from datetime import datetime

from pydantic import BaseModel


class AlertResponse(BaseModel):
    alert_id: str
    title: str
    severity: str
    message: str
    zone_id: str
    created_at: datetime