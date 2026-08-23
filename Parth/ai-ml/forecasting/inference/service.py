import pandas as pd

from forecasting.inference.predict import predict_next_hour


def forecast_from_records(
    records: list[dict],
) -> dict:
    """
    Backend-friendly inference interface.

    Vaibhav backend can pass validated historical
    AQI/weather records directly into this function.
    """

    if not records:
        raise ValueError(
            "At least one historical record is required."
        )

    df = pd.DataFrame(records)

    return predict_next_hour(df)