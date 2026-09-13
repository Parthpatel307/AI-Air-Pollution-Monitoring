"""Persistent fallback cache for live AQI data."""

from datetime import datetime, timezone
from typing import Any

from app.database import get_firestore


COLLECTION_NAME = "live_aqi_cache"


def save_live_zone(
    zone: dict[str, Any],
) -> None:
    """
    Save latest successful live data for one zone.
    """

    zone_id = zone.get("zone_id")

    if not zone_id:
        return

    db = get_firestore()

    payload = {
        **zone,
        "cached_at": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    db.collection(
        COLLECTION_NAME
    ).document(
        str(zone_id)
    ).set(
        payload,
        merge=True,
    )


def save_live_network(
    zones: list[dict[str, Any]],
) -> None:
    """
    Save latest successful data
    for all live zones.
    """

    db = get_firestore()

    batch = db.batch()

    cached_at = datetime.now(
        timezone.utc
    ).isoformat()

    count = 0

    for zone in zones:
        zone_id = zone.get(
            "zone_id"
        )

        if not zone_id:
            continue

        reference = (
            db.collection(
                COLLECTION_NAME
            ).document(
                str(zone_id)
            )
        )

        batch.set(
            reference,
            {
                **zone,
                "cached_at":
                    cached_at,
            },
            merge=True,
        )

        count += 1

    if count > 0:
        batch.commit()


def get_cached_zone(
    zone_id: str,
) -> dict[str, Any] | None:
    """
    Return last successful cached data
    for one zone.
    """

    db = get_firestore()

    document = (
        db.collection(
            COLLECTION_NAME
        )
        .document(zone_id)
        .get()
    )

    if not document.exists:
        return None

    data = (
        document.to_dict()
        or {}
    )

    data["zone_id"] = zone_id

    data["live"] = False

    data["stale"] = True

    data["source"] = (
        "firestore_cache"
    )

    return data


def get_cached_network() -> list[
    dict[str, Any]
]:
    """
    Return all cached live-zone data.
    """

    db = get_firestore()

    documents = (
        db.collection(
            COLLECTION_NAME
        ).stream()
    )

    zones = []

    for document in documents:
        data = (
            document.to_dict()
            or {}
        )

        data["zone_id"] = (
            document.id
        )

        data["live"] = False

        data["stale"] = True

        data["source"] = (
            "firestore_cache"
        )

        zones.append(data)

    return zones