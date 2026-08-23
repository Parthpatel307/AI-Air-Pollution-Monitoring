from fastapi import APIRouter, HTTPException, Query

from app.schemas.forecast import ForecastResponse
from app.services.forecast_service import get_forecast

router = APIRouter(
    prefix="/api/v1/forecast",
    tags=["Forecast"],
)


@router.get("", response_model=ForecastResponse)
def get_forecast_data(
    zone_id: str,
    hours: int = Query(default=24, ge=1, le=168),
) -> ForecastResponse:
    records = get_forecast(zone_id=zone_id, hours=hours)

    if not records:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "FORECAST_DATA_NOT_FOUND",
                    "message": f"No forecast data found for zone '{zone_id}'.",
                },
            },
        )

    return ForecastResponse(
        zone_id=zone_id,
        forecast=[
            {
                "timestamp": record.timestamp,
                "predicted_aqi": record.predicted_aqi,
                "risk_level": record.risk_level,
                "confidence": record.confidence,
            }
            for record in records
        ],
    )