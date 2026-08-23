from io import BytesIO

import pytest
from fastapi import HTTPException, UploadFile
from starlette.datastructures import Headers

from app.routers.evidence import upload_evidence


def test_evidence_rejects_unsupported_content_type_without_firestore_write():
    upload = UploadFile(
        filename="payload.exe",
        file=BytesIO(b"not an accepted evidence type"),
        headers=Headers({"content-type": "application/x-msdownload"}),
    )

    with pytest.raises(HTTPException) as error:
        __import__("asyncio").run(
            upload_evidence(
                incident_id="incident-1",
                evidence_type="DOCUMENT",
                title="Invalid",
                description="Invalid type",
                file=upload,
                user={"uid": "citizen-1", "role": "CITIZEN"},
            )
        )

    assert error.value.status_code == 400
    assert error.value.detail["error"]["code"] == "UNSUPPORTED_FILE_TYPE"
