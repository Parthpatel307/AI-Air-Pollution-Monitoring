"""Report routes."""

from fastapi import APIRouter, Query

from app.database import get_firestore
from app.schemas.report import ReportResponse

router = APIRouter(
    prefix="/api/v1/reports",
    tags=["Reports"],
)


@router.get("", response_model=list[ReportResponse])
def get_reports(
    zone_id: str | None = Query(default=None),
    report_type: str | None = Query(default=None),
) -> list[ReportResponse]:
    db = get_firestore()

    query = db.collection("reports")

    if zone_id:
        query = query.where("zone_id", "==", zone_id)

    if report_type:
        query = query.where("report_type", "==", report_type)

    documents = query.stream()

    reports: list[ReportResponse] = []

    for document in documents:
        data = document.to_dict()

        reports.append(
            ReportResponse(
                report_id=document.id,
                zone_id=data["zone_id"],
                title=data["title"],
                report_type=data["report_type"],
                summary=data["summary"],
                generated_at=data["generated_at"],
            )
        )

    return reports