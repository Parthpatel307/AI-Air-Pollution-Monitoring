"""Utilities for preparing images for vision inference."""


def validate_image_path(image_path):
    """Return whether an image path value was provided."""
    return bool(image_path)