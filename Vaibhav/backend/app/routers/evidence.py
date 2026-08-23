"""Evidence routes."""

from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, Depends

from app.database import get_firestore
from app.schemas.evidence import EvidenceResponse, EvidenceUploadResponse
from app.dependencies import require_roles

router = APIRouter(
    prefix="/api/v1/evidence",
    tags=["Evidence"],
)


ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}


@router.get("", response_model=list[EvidenceResponse])
def get_evidence(
    incident_id: str | None = Query(default=None),
) -> list[EvidenceResponse]:
    db = get_firestore()

    query = db.collection("evidence")

    if incident_id:
        query = query.where("incident_id", "==", incident_id)

    documents = query.stream()

    evidence_items: list[EvidenceResponse] = []

    for document in documents:
        data = document.to_dict()

        evidence_items.append(
            EvidenceResponse(
                evidence_id=document.id,
                incident_id=data["incident_id"],
                evidence_type=data["evidence_type"],
                title=data["title"],
                description=data["description"],
                url=data.get("url"),
                created_at=data["created_at"],
            )
        )

    return evidence_items


@router.post("", response_model=EvidenceUploadResponse)
async def upload_evidence(
    incident_id: str = Form(...),
    evidence_type: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...),
    user: dict = Depends(require_roles(["CITIZEN", "AUTHORITY", "ADMIN"])),
) -> EvidenceUploadResponse:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "UNSUPPORTED_FILE_TYPE",
                    "message": (
                        "Unsupported file type. "
                        "Supported formats are image, video, and document files."
                    ),
                },
            },
        )

    evidence_id = f"evidence_{uuid4().hex}"

    # Temporary local/private storage.
    # The file is not exposed through a public URL.
    upload_directory = Path("private_uploads") / "evidence"
    upload_directory.mkdir(parents=True, exist_ok=True)

    original_name = Path(file.filename or "uploaded_file").name
    file_path = upload_directory / f"{evidence_id}_{original_name}"

    file_content = await file.read()
    file_path.write_bytes(file_content)

    now = datetime.now(timezone.utc)

    db = get_firestore()

    db.collection("evidence").document(evidence_id).set(
        {
            "incident_id": incident_id,
            "evidence_type": evidence_type,
            "title": title,
            "description": description,
            "url": None,
            "created_at": now,
            "storage_path": str(file_path),
            "original_filename": original_name,
            "content_type": file.content_type,
        }
    )

    return EvidenceUploadResponse(
        success=True,
        data={
            "evidence_id": evidence_id,
            "status": "UPLOADED",
        },
    )