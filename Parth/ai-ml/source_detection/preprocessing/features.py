import pandas as pd


REQUIRED_COLUMNS = [
    "pm25",
    "pm10",
    "no2",
    "so2",
    "co",
    "temperature",
    "humidity",
    "wind_speed",
    "source",
]


FEATURE_COLUMNS = [
    "pm25",
    "pm10",
    "no2",
    "so2",
    "co",
    "temperature",
    "humidity",
    "wind_speed",
    "pm_ratio",
    "no2_pm25_ratio",
    "so2_pm25_ratio",
    "co_pm25_ratio",
    "low_wind",
    "high_humidity",
]


def validate_columns(df: pd.DataFrame) -> None:
    missing = [
        column
        for column in REQUIRED_COLUMNS
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Missing required columns: {missing}"
        )


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    validate_columns(df)

    df = df.copy()

    numeric_columns = [
        "pm25",
        "pm10",
        "no2",
        "so2",
        "co",
        "temperature",
        "humidity",
        "wind_speed",
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )

    df = df.dropna(
        subset=numeric_columns + ["source"]
    ).reset_index(drop=True)

    df["pm_ratio"] = (
        df["pm25"]
        / df["pm10"].replace(0, 1e-6)
    )

    df["no2_pm25_ratio"] = (
        df["no2"]
        / df["pm25"].replace(0, 1e-6)
    )

    df["so2_pm25_ratio"] = (
        df["so2"]
        / df["pm25"].replace(0, 1e-6)
    )

    df["co_pm25_ratio"] = (
        df["co"]
        / df["pm25"].replace(0, 1e-6)
    )

    df["low_wind"] = (
        df["wind_speed"] < 4
    ).astype(int)

    df["high_humidity"] = (
        df["humidity"] > 75
    ).astype(int)

    return df