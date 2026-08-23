import pandas as pd

from forecasting.inference.predict import predict_next_hour


def test_predict_next_hour():
    timestamps = pd.date_range(
        "2026-01-01",
        periods=50,
        freq="h",
        tz="UTC",
    )

    data = {
        "timestamp": timestamps,
        "zone_id": ["zone_001"] * 50,
        "aqi": list(range(100, 150)),
        "pm25": list(range(50, 100)),
        "pm10": list(range(80, 130)),
        "no2": [30] * 50,
        "so2": [10] * 50,
        "co": [0.8] * 50,
        "temperature": [30] * 50,
        "humidity": [60] * 50,
        "wind_speed": [8] * 50,
    }

    df = pd.DataFrame(data)

    result = predict_next_hour(df)

    assert result["zone_id"] == "zone_001"
    assert "predicted_aqi" in result
    assert "risk_level" in result
    assert result["forecast_horizon_hours"] == 1