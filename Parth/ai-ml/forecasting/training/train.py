from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from forecasting.preprocessing.features import prepare_features


FEATURE_COLUMNS = [
    "aqi",
    "pm25",
    "pm10",
    "no2",
    "so2",
    "co",
    "temperature",
    "humidity",
    "wind_speed",
    "hour",
    "day_of_week",
    "month",
    "aqi_lag_1",
    "aqi_lag_2",
    "aqi_lag_3",
    "aqi_lag_6",
    "aqi_lag_12",
    "aqi_lag_24",
    "aqi_rolling_mean_3",
    "aqi_rolling_mean_6",
    "aqi_rolling_mean_12",
    "aqi_rolling_mean_24",
]


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = (
    PROJECT_ROOT
    / "forecasting"
    / "data"
    / "aqi_data.csv"
)

MODEL_DIR = (
    PROJECT_ROOT
    / "forecasting"
    / "models"
)

MODEL_PATH = MODEL_DIR / "aqi_forecast_model.joblib"


def train_model(
    data_path: Path = DATA_PATH,
    forecast_hours: int = 1,
):
    """
    Train AQI forecasting model.
    """

    print("Loading dataset...")
    df = pd.read_csv(data_path)

    print(f"Raw rows: {len(df)}")

    df = prepare_features(
        df,
        forecast_hours=forecast_hours,
    )

    print(f"Rows after feature engineering: {len(df)}")

    if len(df) < 50:
        raise ValueError(
            "Dataset is too small. "
            "Use at least 50 usable rows after feature engineering."
        )

    X = df[FEATURE_COLUMNS]
    y = df["target_aqi"]

    # Time-based split: no random shuffling
    split_index = int(len(df) * 0.8)

    X_train = X.iloc[:split_index]
    X_test = X.iloc[split_index:]

    y_train = y.iloc[:split_index]
    y_test = y.iloc[split_index:]

    print(f"Training rows: {len(X_train)}")
    print(f"Testing rows: {len(X_test)}")

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=15,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    print("Training model...")
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    mae = mean_absolute_error(
        y_test,
        predictions,
    )

    rmse = mean_squared_error(
        y_test,
        predictions,
    ) ** 0.5

    r2 = r2_score(
        y_test,
        predictions,
    )

    metrics = {
        "mae": float(mae),
        "rmse": float(rmse),
        "r2": float(r2),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "forecast_hours": forecast_hours,
    }

    print("\nModel Metrics")
    print("-" * 30)

    for key, value in metrics.items():
        print(f"{key}: {value}")

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    model_bundle = {
        "model": model,
        "feature_columns": FEATURE_COLUMNS,
        "forecast_hours": forecast_hours,
        "metrics": metrics,
    }

    joblib.dump(
        model_bundle,
        MODEL_PATH,
    )

    print(f"\nModel saved to: {MODEL_PATH}")

    return model_bundle


if __name__ == "__main__":
    train_model()