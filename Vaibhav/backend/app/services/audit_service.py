"""Audit logging service."""

from datetime import datetime, timezone

from app.database import get_firestore
from app.models.audit import AuditRecord


def create_audit_log(
    user_id: str,
    action: str,
    resource_id: str,
) -> AuditRecord:
    timestamp = datetime.now(timezone.utc)

    audit_record = AuditRecord(
        user_id=user_id,
        action=action,
        resource_id=resource_id,
        timestamp=timestamp,
    )

    db = get_firestore()

    # Use .add() to push a document with a server-side timestamp
    db.collection("audit_logs").add(
        {
            "user_id": audit_record.user_id,
            "action": audit_record.action,
            "resource_id": audit_record.resource_id,
            "timestamp": audit_record.timestamp,
        }
    )

    return audit_record