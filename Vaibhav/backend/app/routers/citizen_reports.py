"""Citizen report routes."""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, Depends

from app.database import get_firestore
from app.schemas.citizen_report import (
    CitizenReportCreate,
    CitizenReportResponse,
)
from app.dependencies import require_roles

router = APIRouter(
    prefix="/api/v1/citizen-reports",
    tags=["Citizen Reports"],
)


@router.get("", response_model=list[CitizenReportResponse])
def get_citizen_reports(
    zone_id: str | None = Query(default=None),
    status: str | None = Query(default=None),
) -> list[CitizenReportResponse]:
    db = get_firestore()

    query = db.collection("citizen_reports")

    if zone_id:
        query = query.where("zone_id", "==", zone_id)

    if status:
        query = query.where("status", "==", status)

    documents = query.order_by(
        "created_at",
        direction="DESCENDING",
    ).stream()

    reports: list[CitizenReportResponse] = []

    for document in documents:
        data = document.to_dict()

        reports.append(
            CitizenReportResponse(
                report_id=document.id,
                title=data["title"],
                description=data["description"],
                zone_id=data["zone_id"],
                latitude=data["latitude"],
                longitude=data["longitude"],
                category=data["category"],
                status=data["status"],
                created_at=data["created_at"],
            )
        )

    return reports


@router.post("", response_model=CitizenReportResponse, status_code=201)
def create_citizen_report(
    report: CitizenReportCreate,
    user: dict = Depends(require_roles(["CITIZEN", "AUTHORITY", "ADMIN"])),
) -> CitizenReportResponse:
    db = get_firestore()

    zone_document = db.collection("zones").document(report.zone_id).get()

    if not zone_document.exists:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "ZONE_NOT_FOUND",
                    "message": f"Zone '{report.zone_id}' was not found.",
                },
            },
        )

    created_at = datetime.now(timezone.utc)

    document_reference = db.collection("citizen_reports").document()

    document_reference.set(
        {
            "title": report.title,
            "description": report.description,
            "zone_id": report.zone_id,
            "latitude": report.latitude,
            "longitude": report.longitude,
            "category": report.category,
            "status": "SUBMITTED",
            "created_at": created_at,
        }
    )

    return CitizenReportResponse(
        report_id=document_reference.id,
        title=report.title,
        description=report.description,
        zone_id=report.zone_id,
        latitude=report.latitude,
        longitude=report.longitude,
        category=report.category,
        status="SUBMITTED",
        created_at=created_at,
    )