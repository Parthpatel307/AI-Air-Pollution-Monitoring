from datetime import datetime, timezone

from fastapi import APIRouter, Query

from app.database import get_firestore
from app.schemas.alert import AlertResponse

router = APIRouter(
    prefix="/api/v1/alerts",
    tags=["Alerts"],
)


@router.get("", response_model=list[AlertResponse])
def get_alerts(
    zone_id: str | None = Query(default=None),
    active: bool = Query(default=True),
) -> list[AlertResponse]:
    db = get_firestore()

    query = db.collection("alerts")

    if zone_id:
        query = query.where("zone_id", "==", zone_id)

    if active:
        query = query.where("active", "==", True)

    documents = query.order_by("created_at", direction="DESCENDING").stream()

    alerts: list[AlertResponse] = []

    for document in documents:
        data = document.to_dict()

        alerts.append(
            AlertResponse(
                alert_id=document.id,
                title=data["title"],
                severity=data["severity"],
                message=data["message"],
                zone_id=data["zone_id"],
                created_at=data["created_at"],
            )
        )

    return alerts