from pathlib import Path

import pytest

from vision.preprocessing.image_utils import (
    validate_image,
)


def test_validate_missing_image():
    with pytest.raises(
        FileNotFoundError
    ):
        validate_image(
            "does-not-exist.jpg"
        )


def test_validate_unsupported_extension(
    tmp_path: Path,
):
    file_path = tmp_path / "test.txt"
    file_path.write_text(
        "not an image",
        encoding="utf-8",
    )

    with pytest.raises(
        ValueError
    ):
        validate_image(
            str(file_path)
        )


from vision.inference.analyze import _extract_json


def test_extract_structured_json():
    raw = """
    {
        "classification": "AMBIGUOUS_INCONCLUSIVE",
        "confidence": 0.25,
        "detected_objects": [
            "smoke_or_vapor"
        ],
        "explanation": "Insufficient environmental context.",
        "limitations": [
            "No visible source"
        ],
        "review_required": true
    }
    """

    result = _extract_json(raw)

    assert result["classification"] == (
        "AMBIGUOUS_INCONCLUSIVE"
    )

    assert result["confidence"] == 0.25

    assert result["review_required"] is True