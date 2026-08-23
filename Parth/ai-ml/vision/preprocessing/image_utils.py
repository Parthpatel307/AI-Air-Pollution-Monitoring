from pathlib import Path


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


MAX_FILE_SIZE_MB = 10


def validate_image(path: str) -> Path:
    """
    Validate that the input path points to a supported
    image file within the allowed size.
    """

    file_path = Path(path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"Image not found: {file_path}"
        )

    if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise ValueError(
            "Unsupported image format. "
            "Allowed: jpg, jpeg, png, webp"
        )

    size_mb = (
        file_path.stat().st_size
        / (1024 * 1024)
    )

    if size_mb > MAX_FILE_SIZE_MB:
        raise ValueError(
            f"Image size exceeds {MAX_FILE_SIZE_MB} MB."
        )

    return file_path