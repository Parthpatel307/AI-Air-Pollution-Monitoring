"""Report schemas."""

from datetime import datetime

from pydantic import BaseModel


class ReportResponse(BaseModel):
    report_id: str
    zone_id: str
    title: str
    report_type: str
    summary: str
    generated_at: datetime