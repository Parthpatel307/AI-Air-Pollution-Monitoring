from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from forecasting.preprocessing.features import prepare_features


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "forecasting"
    / "models"
    / "aqi_forecast_model.joblib"
)


def load_model_bundle() -> dict[str, Any]:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )

    return joblib.load(MODEL_PATH)


def get_risk_level(aqi: float) -> str:
    if aqi <= 50:
        return "GOOD"
    if aqi <= 100:
        return "MODERATE"
    if aqi <= 150:
        return "HIGH"
    if aqi <= 200:
        return "VERY_HIGH"
    return "SEVERE"


def predict_next_hour(
    df: pd.DataFrame,
) -> dict[str, Any]:

    bundle = load_model_bundle()

    model = bundle["model"]
    feature_columns = bundle["feature_columns"]
    forecast_hours = bundle["forecast_hours"]
    metrics = bundle["metrics"]

    prepared = prepare_features(
        df,
        forecast_hours=forecast_hours,
    )

    if prepared.empty:
        raise ValueError(
            "Not enough historical data."
        )

    latest = prepared.iloc[[-1]]

    prediction = float(
        model.predict(
            latest[feature_columns]
        )[0]
    )

    prediction = max(
        0.0,
        prediction,
    )

    return {
        "zone_id": str(
            latest["zone_id"].iloc[0]
        ),
        "predicted_aqi": round(
            prediction,
            2,
        ),
        "risk_level": get_risk_level(
            prediction
        ),
        "forecast_horizon_hours": forecast_hours,
        "timestamp": str(
            latest["timestamp"].iloc[0]
        ),
        "model_version": "aqi-forecast-v1",
        "model_metrics": {
            "mae": metrics["mae"],
            "rmse": metrics["rmse"],
            "r2": metrics["r2"],
        },
    }