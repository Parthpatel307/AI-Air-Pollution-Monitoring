"""Shared FastAPI dependencies.

Provides Firebase token verification and role-based dependencies used by
route handlers. These dependencies use the Firebase Admin SDK already
initialized in app.integrations.firebase.
"""
from typing import Any, Callable, List

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import firebase_admin.auth as firebase_auth

security = HTTPBearer(auto_error=False)


def verify_token(
	credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
	if credentials is None:
		raise HTTPException(
			status_code=401,
			detail={
				"success": False,
				"error": {
					"code": "UNAUTHORIZED",
					"message": "Invalid or missing authentication token.",
				},
			},
		)

	token = credentials.credentials

	try:
		decoded = firebase_auth.verify_id_token(token)
	except Exception:
		raise HTTPException(
			status_code=401,
			detail={
				"success": False,
				"error": {
					"code": "UNAUTHORIZED",
					"message": "Invalid or missing authentication token.",
				},
			},
		)

	return decoded


def require_roles(allowed_roles: List[str]) -> Callable[..., Any]:
	def _dep(token_data: dict = Depends(verify_token)) -> dict:
		# Firebase custom claims are present at top-level of token payload
		role = token_data.get("role") or token_data.get("roles")

		if isinstance(role, str):
			roles = [role]
		elif isinstance(role, list):
			roles = role
		else:
			roles = []

		# Allow if any allowed role is present
		for allowed in allowed_roles:
			if allowed in roles:
				return token_data

		raise HTTPException(
			status_code=403,
			detail={
				"success": False,
				"error": {
					"code": "FORBIDDEN",
					"message": "Insufficient permissions for this operation.",
				},
			},
		)

	return _dep

