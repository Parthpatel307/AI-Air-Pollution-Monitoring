from typing import Any

from source_detection.inference.ml_predict import (
    predict_source,
)


def run_source_detection(
    data: dict[str, Any],
) -> dict[str, Any]:
    """
    Public integration interface for ML-based
    pollution source detection.
    """

    return predict_source(data)