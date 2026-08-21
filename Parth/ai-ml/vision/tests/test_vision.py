from vision.preprocessing.image_utils import validate_image_path


def test_validate_image_path_accepts_value():
    assert validate_image_path("evidence.jpg") is True


def test_validate_image_path_rejects_empty_value():
    assert validate_image_path("") is False