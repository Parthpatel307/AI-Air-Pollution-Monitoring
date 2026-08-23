import pandas as pd


REQUIRED_COLUMNS = [
    "timestamp",
    "zone_id",
    "aqi",
    "pm25",
    "pm10",
    "no2",
    "so2",
    "co",
    "temperature",
    "humidity",
    "wind_speed",
]


def validate_columns(df: pd.DataFrame) -> None:
    missing_columns = [
        column
        for column in REQUIRED_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    validate_columns(df)

    df = df.copy()

    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce",
        utc=True,
    )

    numeric_columns = [
        "aqi",
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
        subset=["timestamp", "zone_id", "aqi"]
    )

    df = df.sort_values(
        by=["zone_id", "timestamp"]
    ).reset_index(drop=True)

    return df


def create_time_features(
    df: pd.DataFrame,
) -> pd.DataFrame:
    df = df.copy()

    df["hour"] = df["timestamp"].dt.hour
    df["day_of_week"] = df["timestamp"].dt.dayofweek
    df["month"] = df["timestamp"].dt.month

    return df


def create_lag_features(
    df: pd.DataFrame,
    lags: list[int] = [1, 2, 3, 6, 12, 24],
) -> pd.DataFrame:
    df = df.copy()

    for lag in lags:
        df[f"aqi_lag_{lag}"] = (
            df.groupby("zone_id")["aqi"]
            .shift(lag)
        )

    return df


def create_rolling_features(
    df: pd.DataFrame,
    windows: list[int] = [3, 6, 12, 24],
) -> pd.DataFrame:
    df = df.copy()

    for window in windows:
        df[f"aqi_rolling_mean_{window}"] = (
            df.groupby("zone_id")["aqi"]
            .transform(
                lambda series: series.shift(1)
                .rolling(
                    window=window,
                    min_periods=1,
                )
                .mean()
            )
        )

    return df


def create_target(
    df: pd.DataFrame,
    forecast_hours: int = 1,
) -> pd.DataFrame:
    df = df.copy()

    df["target_aqi"] = (
        df.groupby("zone_id")["aqi"]
        .shift(-forecast_hours)
    )

    return df


def prepare_features(
    df: pd.DataFrame,
    forecast_hours: int = 1,
) -> pd.DataFrame:
    df = clean_data(df)
    df = create_time_features(df)
    df = create_lag_features(df)
    df = create_rolling_features(df)
    df = create_target(
        df,
        forecast_hours=forecast_hours,
    )

    return df.dropna().reset_index(drop=True)