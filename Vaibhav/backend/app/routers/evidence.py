"""Evidence routes."""

from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from PIL import Image, ImageOps

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


MAX_FIRESTORE_IMAGE_BYTES = 700_000


def _prepare_image_for_firestore(
    file_content: bytes,
) -> tuple[bytes, str]:
    try:
        with Image.open(
            BytesIO(
                file_content
            )
        ) as source:
            source = (
                ImageOps.exif_transpose(
                    source
                )
            )

            if source.mode != "RGB":
                source = (
                    source.convert(
                        "RGB"
                    )
                )

            for max_side in (
                1600,
                1400,
                1200,
                1000,
                800,
                640,
            ):
                image = source.copy()

                image.thumbnail(
                    (
                        max_side,
                        max_side,
                    ),
                    Image.Resampling.LANCZOS,
                )

                for quality in (
                    85,
                    75,
                    65,
                    55,
                    45,
                ):
                    output = BytesIO()

                    image.save(
                        output,
                        format="JPEG",
                        quality=quality,
                        optimize=True,
                    )

                    data = (
                        output.getvalue()
                    )

                    if (
                        len(data)
                        <=
                        MAX_FIRESTORE_IMAGE_BYTES
                    ):
                        return (
                            data,
                            "image/jpeg",
                        )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code":
                        "INVALID_IMAGE",

                    "message":
                        "The uploaded image could not be processed.",
                },
            },
        ) from exc

    raise HTTPException(
        status_code=413,
        detail={
            "success": False,
            "error": {
                "code":
                    "IMAGE_TOO_LARGE",

                "message": (
                    "The image is too large "
                    "to store as evidence."
                ),
            },
        },
    )


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

    evidence_id = (
        f"evidence_{uuid4().hex}"
    )

    original_name = Path(
        file.filename
        or
        "uploaded_file"
    ).name

    file_content = (
        await file.read()
    )

    content_type = (
        file.content_type
        or
        "application/octet-stream"
    )

    firestore_file_bytes = None

    # -----------------------------------------------------
    # Images:
    # compress + persist inside Firestore.
    #
    # This survives Render restart/redeploy.
    # -----------------------------------------------------

    if content_type.startswith(
        "image/"
    ):
        (
            firestore_file_bytes,
            stored_content_type,
        ) = _prepare_image_for_firestore(
            file_content
        )

        upload_directory = (
            Path("private_uploads")
            / "evidence"
        )

        upload_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        file_path = (
            upload_directory
            / f"{evidence_id}.jpg"
        )

        # Keep local copy as fast fallback.
        file_path.write_bytes(
            firestore_file_bytes
        )

        stored_file_size = len(
            firestore_file_bytes
        )

    else:
        stored_content_type = (
            content_type
        )

        upload_directory = (
            Path("private_uploads")
            / "evidence"
        )

        upload_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        file_path = (
            upload_directory
            / f"{evidence_id}_{original_name}"
        )

        file_path.write_bytes(
            file_content
        )

        stored_file_size = len(
            file_content
        )

    now = datetime.now(
        timezone.utc
    )

    db = get_firestore()

    document_data = {
        "incident_id":
            incident_id,

        "evidence_type":
            evidence_type,

        "title":
            title,

        "description":
            description,

        "url":
            None,

        "created_at":
            now,

        "storage_path":
            str(file_path),

        "original_filename":
            original_name,

        "content_type":
            stored_content_type,

        "file_size":
            stored_file_size,

        "storage_backend":
            (
                "firestore"
                if firestore_file_bytes
                is not None
                else
                "local"
            ),
    }

    if (
        firestore_file_bytes
        is not None
    ):
        document_data[
            "file_bytes"
        ] = firestore_file_bytes

    db.collection(
        "evidence"
    ).document(
        evidence_id
    ).set(
        document_data
    )

    return EvidenceUploadResponse(
        success=True,
        data={
            "evidence_id": evidence_id,
            "status": "UPLOADED",
        },
    )
