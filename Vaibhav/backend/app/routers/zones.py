from fastapi import APIRouter, HTTPException, Depends

from app.database import get_firestore
from app.schemas.zone import ZoneCreate, ZoneResponse
from app.dependencies import require_roles

router = APIRouter(
    prefix="/api/v1/zones",
    tags=["Zones"],
)


@router.get("", response_model=list[ZoneResponse])
def get_zones() -> list[ZoneResponse]:
    db = get_firestore()

    zones = []

    for document in db.collection("zones").stream():
        zone = document.to_dict()
        zone["zone_id"] = document.id
        zones.append(zone)

    return zones


@router.get("/{zone_id}", response_model=ZoneResponse)
def get_zone(zone_id: str) -> ZoneResponse:
    db = get_firestore()

    document = db.collection("zones").document(zone_id).get()

    if not document.exists:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "ZONE_NOT_FOUND",
                    "message": f"Zone '{zone_id}' was not found.",
                },
            },
        )

    zone = document.to_dict()
    zone["zone_id"] = document.id

    return zone


@router.post("", response_model=ZoneResponse, status_code=201)
def create_zone(zone: ZoneCreate, user: dict = Depends(require_roles(["ADMIN"]))) -> ZoneResponse:
    db = get_firestore()

    document_ref = db.collection("zones").document(zone.zone_id)

    if document_ref.get().exists:
        raise HTTPException(
            status_code=409,
            detail={
                "success": False,
                "error": {
                    "code": "ZONE_ALREADY_EXISTS",
                    "message": f"Zone '{zone.zone_id}' already exists.",
                },
            },
        )

    zone_data = zone.model_dump(exclude={"zone_id"})
    document_ref.set(zone_data)

    return zone