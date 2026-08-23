import pytest
from fastapi import HTTPException

from app.routers.ai import (
    ai_analyze,
    ai_chat,
    ai_evidence_analyze,
    ai_forecast_explain,
    ai_source_detection,
)


@pytest.mark.parametrize(
    "handler, kwargs",
    [
        (ai_source_detection, {"zone_id": "zone-1"}),
        (ai_analyze, {"payload": {"query": "test"}}),
        (ai_chat, {"message": "test"}),
        (ai_forecast_explain, {"zone_id": "zone-1"}),
        (ai_evidence_analyze, {"evidence_id": "evidence-1"}),
    ],
)
def test_ai_handlers_return_structured_not_configured(handler, kwargs):
    with pytest.raises(HTTPException) as error:
        handler(**kwargs, user={"uid": "authority-1", "role": "AUTHORITY"})

    assert error.value.status_code == 501
    assert error.value.detail["error"]["code"] == "AI_INTEGRATION_NOT_CONFIGURED"
