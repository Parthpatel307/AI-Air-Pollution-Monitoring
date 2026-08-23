import pytest

from app.services.user_service import UserRoleAlreadyAssignedError, provision_citizen_role


class StubUser:
    def __init__(self, custom_claims=None):
        self.custom_claims = custom_claims


def test_provision_citizen_role_sets_only_server_claim(monkeypatch):
    calls = []
    monkeypatch.setattr(
        "app.services.user_service.firebase_auth.get_user",
        lambda uid: StubUser({"tenant": "default"}),
    )
    monkeypatch.setattr(
        "app.services.user_service.firebase_auth.set_custom_user_claims",
        lambda uid, claims: calls.append((uid, claims)),
    )

    assert provision_citizen_role("uid-new") == "PROVISIONED"
    assert calls == [("uid-new", {"tenant": "default", "role": "CITIZEN"})]


def test_provision_citizen_role_is_idempotent(monkeypatch):
    set_claims = lambda *args: pytest.fail("existing citizen claims must not be rewritten")
    monkeypatch.setattr(
        "app.services.user_service.firebase_auth.get_user",
        lambda uid: StubUser({"role": "CITIZEN"}),
    )
    monkeypatch.setattr(
        "app.services.user_service.firebase_auth.set_custom_user_claims",
        set_claims,
    )

    assert provision_citizen_role("uid-existing") == "ALREADY_PROVISIONED"


def test_provision_citizen_role_does_not_overwrite_existing_role(monkeypatch):
    monkeypatch.setattr(
        "app.services.user_service.firebase_auth.get_user",
        lambda uid: StubUser({"role": "AUTHORITY"}),
    )

    with pytest.raises(UserRoleAlreadyAssignedError):
        provision_citizen_role("uid-authority")