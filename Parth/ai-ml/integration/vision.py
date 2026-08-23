from typing import Any

from vision.inference.analyze import (
    analyze_image_structured,
)


def run_evidence_analysis(
    image_path: str,
) -> dict[str, Any]:
    """
    Public interface for multimodal evidence analysis.
    """

    return analyze_image_structured(
        image_path
    )