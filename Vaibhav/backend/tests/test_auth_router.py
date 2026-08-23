from fastapi import HTTPException

from app.routers import auth


def test_provision_citizen_uses_verified_uid_and_returns_role(monkeypatch):
    received = []
    monkeypatch.setattr(
        auth,
        "provision_citizen_role",
        lambda uid: received.append(uid) or "PROVISIONED",
    )

    response = auth.provision_citizen({"uid": "uid-verified", "role": "CITIZEN"})

    assert received == ["uid-verified"]
    assert response["data"] == {
        "uid": "uid-verified",
        "role": "CITIZEN",
        "status": "PROVISIONED",
    }


def test_provision_citizen_rejects_existing_different_role(monkeypatch):
    monkeypatch.setattr(
        auth,
        "provision_citizen_role",
        lambda uid: (_ for _ in ()).throw(auth.UserRoleAlreadyAssignedError()),
    )

    try:
        auth.provision_citizen({"uid": "uid-authority"})
    except HTTPException as error:
        assert error.status_code == 409
    else:
        raise AssertionError("expected role conflict")