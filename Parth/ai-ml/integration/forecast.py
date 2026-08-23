from typing import Any

from forecasting.inference.service import (
    forecast_from_records,
)


def run_forecast(
    records: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Public integration interface for AQI forecasting.

    Vaibhav backend should call only this function,
    not the internal forecasting modules directly.
    """

    return forecast_from_records(records)