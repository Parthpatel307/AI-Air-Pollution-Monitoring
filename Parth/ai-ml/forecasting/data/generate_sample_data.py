from pathlib import Path

import numpy as np
import pandas as pd


np.random.seed(42)

ROWS = 500

timestamps = pd.date_range(
    start="2026-01-01",
    periods=ROWS,
    freq="h",
    tz="UTC",
)

records = []

base_aqi = 120.0

for i, timestamp in enumerate(timestamps):

    daily_cycle = 15 * np.sin(
        2 * np.pi * timestamp.hour / 24
    )

    trend = i * 0.03

    noise = np.random.normal(0, 5)

    aqi = max(
        20,
        base_aqi + daily_cycle + trend + noise,
    )

    pm25 = max(
        5,
        aqi * 0.52 + np.random.normal(0, 4),
    )

    pm10 = max(
        10,
        aqi * 0.85 + np.random.normal(0, 8),
    )

    no2 = max(
        5,
        25 + timestamp.hour * 0.8 + np.random.normal(0, 3),
    )

    so2 = max(
        1,
        10 + np.random.normal(0, 1.5),
    )

    co = max(
        0.1,
        0.6 + aqi / 1000 + np.random.normal(0, 0.05),
    )

    temperature = (
        27
        + 6 * np.sin(
            2 * np.pi * timestamp.hour / 24
        )
        + np.random.normal(0, 1)
    )

    humidity = (
        65
        - 10 * np.sin(
            2 * np.pi * timestamp.hour / 24
        )
        + np.random.normal(0, 3)
    )

    wind_speed = max(
        0.5,
        7 + np.random.normal(0, 2),
    )

    records.append(
        {
            "timestamp": timestamp.isoformat(),
            "zone_id": "zone_001",
            "aqi": round(aqi, 2),
            "pm25": round(pm25, 2),
            "pm10": round(pm10, 2),
            "no2": round(no2, 2),
            "so2": round(so2, 2),
            "co": round(co, 3),
            "temperature": round(temperature, 2),
            "humidity": round(humidity, 2),
            "wind_speed": round(wind_speed, 2),
        }
    )

df = pd.DataFrame(records)

output_path = (
    Path(__file__).resolve().parent
    / "aqi_data.csv"
)

df.to_csv(
    output_path,
    index=False,
)

print(f"Generated {len(df)} rows")
print(f"Saved to: {output_path}")