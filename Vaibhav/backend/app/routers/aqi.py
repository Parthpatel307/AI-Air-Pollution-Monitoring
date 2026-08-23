from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from app.database import get_firestore
from app.schemas.aqi import AQICurrentResponse, AQIHistoryResponse

router = APIRouter(
    prefix="/api/v1/aqi",
    tags=["AQI"],
)


@router.get("/current", response_model=AQICurrentResponse)
def get_current_aqi(zone_id: str | None = None) -> AQICurrentResponse:
    db = get_firestore()

    if zone_id:
        zone_document = db.collection("zones").document(zone_id).get()

        if not zone_document.exists:
            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": {
                        "code": "ZONE_NOT_FOUND",
                        "message": f"Zone '{zone_id}' was not found.",
                    },
                },
            )

        zone = zone_document.to_dict()
        zone["zone_id"] = zone_document.id
    else:
        documents = list(db.collection("zones").limit(1).stream())

        if not documents:
            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": {
                        "code": "NO_ZONES_FOUND",
                        "message": "No zones are available.",
                    },
                },
            )

        zone = documents[0].to_dict()
        zone["zone_id"] = documents[0].id

    aqi_document = (
        db.collection("aqi_readings")
        .where("zone_id", "==", zone["zone_id"])
        .order_by("timestamp", direction="DESCENDING")
        .limit(1)
        .stream()
    )

    readings = list(aqi_document)

    if not readings:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "AQI_DATA_NOT_FOUND",
                    "message": f"No AQI data found for zone '{zone['zone_id']}'.",
                },
            },
        )

    reading = readings[0].to_dict()

    return AQICurrentResponse(
        zone_id=zone["zone_id"],
        zone_name=zone["name"],
        aqi=reading["aqi"],
        category=reading["category"],
        pm25=reading["pm25"],
        pm10=reading["pm10"],
        no2=reading["no2"],
        so2=reading["so2"],
        co=reading["co"],
        temperature=reading["temperature"],
        humidity=reading["humidity"],
        wind_speed=reading["wind_speed"],
        timestamp=reading["timestamp"],
    )


@router.get("/history", response_model=AQIHistoryResponse)
def get_aqi_history(
    zone_id: str = Query(...),
    limit: int = Query(default=24, ge=1, le=168),
) -> AQIHistoryResponse:
    db = get_firestore()

    zone_document = db.collection("zones").document(zone_id).get()

    if not zone_document.exists:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "ZONE_NOT_FOUND",
                    "message": f"Zone '{zone_id}' was not found.",
                },
            },
        )

    zone = zone_document.to_dict()

    documents = (
        db.collection("aqi_readings")
        .where("zone_id", "==", zone_id)
        .order_by("timestamp", direction="DESCENDING")
        .limit(limit)
        .stream()
    )

    readings = list(documents)

    if not readings:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "AQI_HISTORY_NOT_FOUND",
                    "message": f"No AQI history found for zone '{zone_id}'.",
                },
            },
        )

    history: list[AQICurrentResponse] = []

    for document in readings:
        data = document.to_dict()

        history.append(
            AQICurrentResponse(
                zone_id=zone_id,
                zone_name=zone["name"],
                aqi=data["aqi"],
                category=data["category"],
                pm25=data["pm25"],
                pm10=data["pm10"],
                no2=data["no2"],
                so2=data["so2"],
                co=data["co"],
                temperature=data["temperature"],
                humidity=data["humidity"],
                wind_speed=data["wind_speed"],
                timestamp=data["timestamp"],
            )
        )

    return AQIHistoryResponse(
        zone_id=zone_id,
        zone_name=zone["name"],
        readings=history,
    )