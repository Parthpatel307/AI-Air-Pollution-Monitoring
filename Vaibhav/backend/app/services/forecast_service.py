from datetime import datetime, timedelta, timezone

from app.database import get_firestore
from app.models.forecast import ForecastRecord


def get_forecast(
    zone_id: str,
    hours: int,
) -> list[ForecastRecord]:
    db = get_firestore()

    documents = (
        db.collection("forecasts")
        .where("zone_id", "==", zone_id)
        .order_by("timestamp")
        .limit(hours)
        .stream()
    )

    records: list[ForecastRecord] = []

    for document in documents:
        data = document.to_dict()

        records.append(
            ForecastRecord(
                zone_id=zone_id,
                timestamp=data["timestamp"],
                predicted_aqi=data["predicted_aqi"],
                risk_level=data["risk_level"],
                confidence=data["confidence"],
            )
        )

    return records