"""Audit model."""

from dataclasses import dataclass
from datetime import datetime


@dataclass
class AuditRecord:
    user_id: str
    action: str
    resource_id: str
    timestamp: datetime