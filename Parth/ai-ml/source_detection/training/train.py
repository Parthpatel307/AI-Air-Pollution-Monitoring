from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, f1_score
from sklearn.model_selection import train_test_split

from source_detection.preprocessing.features import (
    FEATURE_COLUMNS,
    build_features,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = (
    PROJECT_ROOT
    / "source_detection"
    / "data"
    / "source_data.csv"
)

MODEL_DIR = (
    PROJECT_ROOT
    / "source_detection"
    / "models"
)

MODEL_PATH = (
    MODEL_DIR
    / "source_classifier.joblib"
)


def train_model():
    df = pd.read_csv(DATA_PATH)

    df = build_features(df)

    X = df[FEATURE_COLUMNS]
    y = df["source"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    print("Training source detection model...")

    model.fit(
        X_train,
        y_train,
    )

    predictions = model.predict(X_test)

    macro_f1 = f1_score(
        y_test,
        predictions,
        average="macro",
    )

    print("\nClassification Report")
    print("-" * 40)
    print(
        classification_report(
            y_test,
            predictions,
            digits=4,
        )
    )

    print(
        f"Macro F1: {macro_f1:.4f}"
    )

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    bundle = {
        "model": model,
        "feature_columns": FEATURE_COLUMNS,
        "classes": list(model.classes_),
        "macro_f1": float(macro_f1),
        "model_version": "source-detection-v1",
    }

    joblib.dump(
        bundle,
        MODEL_PATH,
    )

    print(
        f"\nModel saved to: {MODEL_PATH}"
    )


if __name__ == "__main__":
    train_model()