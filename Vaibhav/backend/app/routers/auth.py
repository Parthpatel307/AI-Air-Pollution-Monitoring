"""Authentication routes."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import verify_token
from app.services.user_service import UserRoleAlreadyAssignedError, provision_citizen_role

import firebase_admin.auth as firebase_auth

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@router.get("/status")
def auth_status() -> dict:
    return {
        "success": True,
        "data": {
            "authentication": "configured",
            "status": "ready",
        },
    }


@router.post("/provision-citizen")
def provision_citizen(user: dict = Depends(verify_token)) -> dict:
    """Provision the authenticated, newly created user as a citizen."""
    uid = user.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Authenticated user identity is unavailable.",
                },
            },
        )

    try:
        provisioning_status = provision_citizen_role(uid)
    except UserRoleAlreadyAssignedError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "success": False,
                "error": {
                    "code": "ROLE_ALREADY_ASSIGNED",
                    "message": "This user already has a different role.",
                },
            },
        )
    except firebase_auth.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": "USER_NOT_FOUND",
                    "message": "Authenticated user was not found.",
                },
            },
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "error": {
                    "code": "AUTH_PROVISIONING_UNAVAILABLE",
                    "message": "User role provisioning is temporarily unavailable.",
                },
            },
        )

    return {
        "success": True,
        "data": {
            "uid": uid,
            "role": "CITIZEN",
            "status": provisioning_status,
        },
    }