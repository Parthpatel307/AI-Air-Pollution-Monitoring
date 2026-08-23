from pathlib import Path

import numpy as np
import pandas as pd


np.random.seed(42)

SAMPLES_PER_CLASS = 150

records = []


def add_samples(source, pm25, pm10, no2, so2, co, temperature, humidity, wind_speed):
    for _ in range(SAMPLES_PER_CLASS):
        records.append(
            {
                "pm25": max(
                    1,
                    np.random.normal(pm25, pm25 * 0.08),
                ),
                "pm10": max(
                    1,
                    np.random.normal(pm10, pm10 * 0.08),
                ),
                "no2": max(
                    1,
                    np.random.normal(no2, no2 * 0.10),
                ),
                "so2": max(
                    1,
                    np.random.normal(so2, max(1, so2 * 0.10)),
                ),
                "co": max(
                    0.05,
                    np.random.normal(co, max(0.05, co * 0.10)),
                ),
                "temperature": np.random.normal(
                    temperature,
                    2,
                ),
                "humidity": np.clip(
                    np.random.normal(humidity, 5),
                    20,
                    95,
                ),
                "wind_speed": max(
                    0.2,
                    np.random.normal(wind_speed, 1),
                ),
                "source": source,
            }
        )


# Vehicle traffic
add_samples(
    "VEHICLE_TRAFFIC",
    pm25=70,
    pm10=100,
    no2=60,
    so2=10,
    co=0.9,
    temperature=30,
    humidity=60,
    wind_speed=5,
)

# Road dust
add_samples(
    "ROAD_DUST",
    pm25=55,
    pm10=145,
    no2=20,
    so2=8,
    co=0.5,
    temperature=32,
    humidity=50,
    wind_speed=6,
)

# Industrial / combustion
add_samples(
    "COMBUSTION_INDUSTRIAL",
    pm25=85,
    pm10=130,
    no2=35,
    so2=35,
    co=1.6,
    temperature=31,
    humidity=55,
    wind_speed=4,
)

# Biomass burning
add_samples(
    "BIOMASS_BURNING",
    pm25=125,
    pm10=150,
    no2=30,
    so2=18,
    co=1.8,
    temperature=29,
    humidity=58,
    wind_speed=3,
)

# Unknown / mixed
add_samples(
    "UNKNOWN",
    pm25=40,
    pm10=65,
    no2=18,
    so2=12,
    co=0.5,
    temperature=28,
    humidity=70,
    wind_speed=8,
)


df = pd.DataFrame(records)

output_path = (
    Path(__file__).resolve().parent
    / "source_data.csv"
)

df.to_csv(
    output_path,
    index=False,
)

print(f"Generated {len(df)} labelled samples")
print(df["source"].value_counts())
print(f"Saved to: {output_path}")