from vision.inference.analyze import (
    analyze_image_structured,
)


if __name__ == "__main__":
    result = analyze_image_structured(
        "vision/test_data/sample_smoke.jpg"
    )

    print(result)