from pathlib import Path

import joblib
import pandas as pd

from source_detection.preprocessing.features import (
    FEATURE_COLUMNS,
    build_features,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "source_detection"
    / "models"
    / "source_classifier.joblib"
)


def load_model_bundle():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Source detection model not found: {MODEL_PATH}"
        )

    return joblib.load(MODEL_PATH)


def predict_source(data: dict) -> dict:
    bundle = load_model_bundle()

    model = bundle["model"]

    df = pd.DataFrame([{
        **data,
        "source": "UNKNOWN",
    }])

    prepared = build_features(df)

    X = prepared[FEATURE_COLUMNS]

    probabilities = model.predict_proba(X)[0]
    classes = model.classes_

    ranked = sorted(
        zip(
            classes,
            probabilities,
        ),
        key=lambda item: item[1],
        reverse=True,
    )

    probable_sources = [
        {
            "source": source,
            "confidence": round(
                float(confidence),
                4,
            ),
        }
        for source, confidence in ranked[:3]
    ]

    top_source = probable_sources[0]

    return {
        "probable_sources": probable_sources,
        "top_source": top_source["source"],
        "top_confidence": top_source["confidence"],
        "method": "RANDOM_FOREST",
        "model_version": bundle["model_version"],
    }