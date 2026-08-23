"""Trusted Firebase user provisioning operations."""

import firebase_admin.auth as firebase_auth


class UserRoleAlreadyAssignedError(Exception):
    """Raised when a user already has a role that must not be overwritten."""


def provision_citizen_role(uid: str) -> str:
    """Assign CITIZEN to an unassigned Firebase user while preserving claims."""
    user = firebase_auth.get_user(uid)
    claims = dict(user.custom_claims or {})
    existing_role = claims.get("role") or claims.get("roles")

    if existing_role:
        if existing_role == "CITIZEN":
            return "ALREADY_PROVISIONED"
        raise UserRoleAlreadyAssignedError

    claims["role"] = "CITIZEN"
    firebase_auth.set_custom_user_claims(uid, claims)
    return "PROVISIONED"