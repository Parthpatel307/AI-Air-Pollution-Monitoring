import pytest
from fastapi import HTTPException

from app.dependencies import require_roles, verify_token


def test_require_roles_no_token(monkeypatch):
    # When verify_id_token raises, verify_token should raise HTTPException
    def fake_verify_id_token(token):
        raise Exception("invalid")

    monkeypatch.setattr("firebase_admin.auth.verify_id_token", fake_verify_id_token)

    class FakeCreds:
        credentials = "bad"

    with pytest.raises(HTTPException) as error:
        verify_token(FakeCreds())

    assert error.value.status_code == 401


def test_verify_token_without_authorization_header_returns_401():
    with pytest.raises(HTTPException) as error:
        verify_token(None)

    assert error.value.status_code == 401


def test_require_roles_rejects_insufficient_role():
    dependency = require_roles(["AUTHORITY"])

    with pytest.raises(HTTPException) as error:
        dependency({"uid": "citizen-1", "role": "CITIZEN"})

    assert error.value.status_code == 403


def test_require_roles_accepts_allowed_role():
    dependency = require_roles(["AUTHORITY", "ADMIN"])
    token_data = {"uid": "authority-1", "role": "AUTHORITY"}

    assert dependency(token_data) == token_data
