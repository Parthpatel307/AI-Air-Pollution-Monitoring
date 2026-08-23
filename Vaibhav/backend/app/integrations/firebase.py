import os
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore


def get_service_account_path() -> str:
    render_secret = Path(
        "/etc/secrets/firebase-service-account-new.json"
    )

    local_secret = Path(
        "config/firebase-service-account-new.json"
    )

    if render_secret.exists():
        return str(render_secret)

    if local_secret.exists():
        return str(local_secret)

    env_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")

    if env_path:
        return env_path

    raise FileNotFoundError(
        "Firebase service account file not found."
    )


if not firebase_admin._apps:
    cred = credentials.Certificate(
        get_service_account_path()
    )

    firebase_admin.initialize_app(cred)


db = firestore.client()