"""Evidence schemas."""

from datetime import datetime

from pydantic import BaseModel


class EvidenceResponse(BaseModel):
    evidence_id: str
    incident_id: str
    evidence_type: str
    title: str
    description: str
    url: str | None = None
    created_at: datetime


class EvidenceUploadResponse(BaseModel):
    success: bool
    data: dict