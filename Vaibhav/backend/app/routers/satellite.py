"""Satellite pollution routes."""

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.database import (
    get_firestore,
)

from app.integrations.earth_engine import (
    get_satellite_no2,
    get_satellite_no2_map,
)


router = APIRouter(
    prefix="/api/v1/satellite",
    tags=["Satellite"],
)


def _get_zone_or_404(
    zone_id: str,
) -> dict:
    db = get_firestore()

    zone_document = (
        db.collection("zones")
        .document(zone_id)
        .get()
    )

    if not zone_document.exists:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code":
                        "ZONE_NOT_FOUND",

                    "message":
                        f"Zone '{zone_id}' was not found.",
                },
            },
        )

    zone = (
        zone_document.to_dict()
        or {}
    )

    latitude = zone.get(
        "latitude"
    )

    longitude = zone.get(
        "longitude"
    )

    if (
        latitude is None
        or longitude is None
    ):
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": {
                    "code":
                        "ZONE_COORDINATES_MISSING",

                    "message":
                        "Zone latitude or longitude is missing.",
                },
            },
        )

    return {
        "zone_id":
            zone_id,

        "name":
            zone.get(
                "name",
                zone_id,
            ),

        "state":
            zone.get(
                "state"
            ),

        "latitude":
            float(latitude),

        "longitude":
            float(longitude),
    }


@router.get("/pollution")
def get_satellite_pollution(
    zone_id: str = Query(
        ...,
        min_length=1,
    ),
    days: int = Query(
        5,
        ge=1,
        le=14,
    ),
) -> dict:
    zone = _get_zone_or_404(
        zone_id
    )

    try:
        satellite = (
            get_satellite_no2(
                latitude=
                    zone["latitude"],

                longitude=
                    zone["longitude"],

                days=
                    days,
            )
        )

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "error": {
                    "code":
                        "EARTH_ENGINE_UNAVAILABLE",

                    "message":
                        str(exc),
                },
            },
        ) from exc

    return {
        "success":
            satellite.get(
                "success",
                False,
            ),

        "zone_id":
            zone["zone_id"],

        "zone_name":
            zone["name"],

        "state":
            zone["state"],

        "latitude":
            zone["latitude"],

        "longitude":
            zone["longitude"],

        "no2":
            satellite.get(
                "no2"
            ),

        "unit":
            satellite.get(
                "unit"
            ),

        "period_days":
            satellite.get(
                "period_days"
            ),

        "radius_m":
            satellite.get(
                "radius_m"
            ),

        "image_count":
            satellite.get(
                "image_count"
            ),

        "satellite_timestamp":
            satellite.get(
                "satellite_timestamp"
            ),

        "source":
            satellite.get(
                "source"
            ),

        "message":
            satellite.get(
                "message"
            ),
    }


@router.get("/no2-map")
def get_satellite_map(
    zone_id: str = Query(
        ...,
        min_length=1,
    ),
    days: int = Query(
        5,
        ge=1,
        le=14,
    ),
) -> dict:
    zone = _get_zone_or_404(
        zone_id
    )

    try:
        satellite_map = (
            get_satellite_no2_map(
                latitude=
                    zone["latitude"],

                longitude=
                    zone["longitude"],

                days=
                    days,
            )
        )

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,

                "error": {
                    "code":
                        "EARTH_ENGINE_MAP_UNAVAILABLE",

                    "message":
                        str(exc),
                },
            },
        ) from exc

    return {
        **satellite_map,

        "zone_id":
            zone["zone_id"],

        "zone_name":
            zone["name"],

        "state":
            zone["state"],

        "latitude":
            zone["latitude"],

        "longitude":
            zone["longitude"],
    }