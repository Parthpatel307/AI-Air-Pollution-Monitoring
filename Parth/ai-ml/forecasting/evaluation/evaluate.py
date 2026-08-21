"""Forecast model evaluation entry point."""


def evaluate_model(model, evaluation_data):
    """Evaluate a forecast model once metrics are defined."""
    return {"model": model, "data": evaluation_data}