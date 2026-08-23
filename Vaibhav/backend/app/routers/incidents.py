"""Incident routes."""

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, Depends

from app.database import get_firestore
from app.schemas.incident import (
    IncidentActionData,
    IncidentActionRequest,
    IncidentActionResponse,
    IncidentDetailResponse,
    IncidentResponse,
)
from app.services.audit_service import create_audit_log
from app.services.websocket_manager import manager
from app.dependencies import require_roles

router = APIRouter(
    prefix="/api/v1/incidents",
    tags=["Incidents"],
)


@router.get("", response_model=list[IncidentResponse])
def get_incidents(
    zone_id: str | None = Query(default=None),
    status: str | None = Query(default=None),
) -> list[IncidentResponse]:
    db = get_firestore()

    query = db.collection("incidents")

    if zone_id:
        query = query.where("zone_id", "==", zone_id)

    if status:
        query = query.where("status", "==", status)

    documents = query.stream()

    incidents: list[IncidentResponse] = []

    for document in documents:
        data = document.to_dict()

        incidents.append(
            IncidentResponse(
                incident_id=document.id,
                title=data["title"],
                severity=data["severity"],
                zone_id=data["zone_id"],
                status=data["status"],
                created_at=data["created_at"],
            )
        )

    return incidents


@router.get(
    "/{incident_id}",
    response_model=IncidentDetailResponse,
)
def get_incident(
    incident_id: str,
) -> IncidentDetailResponse:
    db = get_firestore()

    document = db.collection("incidents").document(incident_id).get()

    if not document.exists:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "INCIDENT_NOT_FOUND",
                    "message": f"Incident '{incident_id}' was not found.",
                },
            },
        )

    data = document.to_dict()

    return IncidentDetailResponse(
        incident_id=document.id,
        title=data["title"],
        severity=data["severity"],
        zone_id=data["zone_id"],
        status=data["status"],
        created_at=data["created_at"],
    )


@router.post(
    "/{incident_id}/action",
    response_model=IncidentActionResponse,
)
def create_incident_action(
    incident_id: str,
    request: IncidentActionRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(require_roles(["AUTHORITY", "ADMIN"])),
) -> IncidentActionResponse:
    db = get_firestore()

    incident_document = (
        db.collection("incidents")
        .document(incident_id)
        .get()
    )

    if not incident_document.exists:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "INCIDENT_NOT_FOUND",
                    "message": f"Incident '{incident_id}' was not found.",
                },
            },
        )

    action_id = f"action_{uuid4().hex}"
    now = datetime.now(timezone.utc)

    db.collection("incident_actions").document(action_id).set(
        {
            "incident_id": incident_id,
            "action": request.action,
            "notes": request.notes,
            "timestamp": now,
        }
    )

    create_audit_log(
        user_id=user.get("uid", "authority"),
        action=request.action,
        resource_id=incident_id,
    )

    background_tasks.add_task(
        manager.broadcast_event,
        "INCIDENT_UPDATED",
        {"incident_id": incident_id, "action_id": action_id, "action": request.action},
        zone_id=incident_document.to_dict().get("zone_id"),
    )

    return IncidentActionResponse(
        success=True,
        data=IncidentActionData(
            incident_id=incident_id,
            action_id=action_id,
            status="RECORDED",
        ),
    )