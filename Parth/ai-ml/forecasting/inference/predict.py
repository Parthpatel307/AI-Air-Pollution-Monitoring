"""Forecast prediction entry point."""


def predict(model, features):
    """Generate predictions once a trained model is available."""
    return model.predict(features) if hasattr(model, "predict") else None