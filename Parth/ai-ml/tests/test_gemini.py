import pytest

from gemini.analysis import get_model_name


def test_gemini_model_name():
    assert get_model_name()