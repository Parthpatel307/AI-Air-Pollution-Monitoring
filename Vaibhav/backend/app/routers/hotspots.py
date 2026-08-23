"""Hotspot routes."""

from fastapi import APIRouter, Query

from app.database import get_firestore
from app.schemas.hotspot import HotspotResponse

router = APIRouter(
    prefix="/api/v1/hotspots",
    tags=["Hotspots"],
)


@router.get("", response_model=list[HotspotResponse])
def get_hotspots(
    zone_id: str | None = Query(default=None),
) -> list[HotspotResponse]:
    db = get_firestore()

    query = db.collection("hotspots")

    if zone_id:
        query = query.where("zone_id", "==", zone_id)

    documents = query.stream()

    hotspots: list[HotspotResponse] = []

    for document in documents:
        data = document.to_dict()

        hotspots.append(
            HotspotResponse(
                hotspot_id=document.id,
                zone_id=data["zone_id"],
                zone_name=data["zone_name"],
                latitude=data["latitude"],
                longitude=data["longitude"],
                aqi=data["aqi"],
                severity=data["severity"],
                detected_at=data["detected_at"],
            )
        )

    return hotspots