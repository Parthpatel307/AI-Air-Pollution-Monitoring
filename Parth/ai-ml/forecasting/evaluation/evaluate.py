from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from forecasting.preprocessing.features import prepare_features


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = (
    PROJECT_ROOT
    / "forecasting"
    / "data"
    / "aqi_data.csv"
)

MODEL_PATH = (
    PROJECT_ROOT
    / "forecasting"
    / "models"
    / "aqi_forecast_model.joblib"
)

REPORT_PATH = (
    PROJECT_ROOT
    / "forecasting"
    / "evaluation"
    / "evaluation_report.json"
)


def evaluate_model():
    df = pd.read_csv(DATA_PATH)

    df = prepare_features(
        df,
        forecast_hours=1,
    )

    bundle = joblib.load(MODEL_PATH)

    model = bundle["model"]
    feature_columns = bundle["feature_columns"]

    X = df[feature_columns]
    y = df["target_aqi"]

    split_index = int(len(df) * 0.8)

    X_test = X.iloc[split_index:]
    y_test = y.iloc[split_index:]

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

    report = {
        "model_version": "aqi-forecast-v1",
        "dataset_rows": int(len(df)),
        "test_rows": int(len(X_test)),
        "mae": float(mae),
        "rmse": float(rmse),
        "r2": float(r2),
        "forecast_hours": 1,
    }

    REPORT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    REPORT_PATH.write_text(
        json.dumps(
            report,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(json.dumps(report, indent=2))

    return report


if __name__ == "__main__":
    evaluate_model()