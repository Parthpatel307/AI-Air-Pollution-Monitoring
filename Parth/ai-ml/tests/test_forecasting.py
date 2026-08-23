import pandas as pd

from forecasting.preprocessing.features import prepare_features


def test_prepare_features():
    data = {
        "timestamp": pd.date_range(
            "2026-01-01",
            periods=50,
            freq="h",
            tz="UTC"
        ),
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

    result = prepare_features(
        df,
        forecast_hours=1
    )

    assert not result.empty
    assert "target_aqi" in result.columns
    assert "aqi_lag_1" in result.columns
    assert "aqi_lag_24" in result.columns
    assert "aqi_rolling_mean_24" in result.columns