import json
import os
from datetime import (
    datetime,
    timedelta,
    timezone,
)

import ee
from dotenv import load_dotenv


load_dotenv()


# =========================================================
# EARTH ENGINE DATASET
# =========================================================

NO2_COLLECTION = (
    "COPERNICUS/S5P/NRTI/L3_NO2"
)

NO2_BAND = (
    "tropospheric_NO2_column_number_density"
)

NO2_SOURCE = (
    "Sentinel-5P / Google Earth Engine"
)

NO2_UNIT = "mol/m^2"

NO2_PALETTE = [
    "081dff",
    "0066ff",
    "00d9ff",
    "00ff9d",
    "c8ff00",
    "ffff00",
    "ff9d00",
    "ff4500",
    "ff0000",
]


_ee_initialized = False


# =========================================================
# INITIALIZE EARTH ENGINE
# =========================================================

def initialize_earth_engine() -> None:
    global _ee_initialized

    if _ee_initialized:
        return

    project_id = os.getenv(
        "EARTH_ENGINE_PROJECT"
    )

    if not project_id:
        raise RuntimeError(
            "EARTH_ENGINE_PROJECT is not configured."
        )

    credentials_path = os.getenv(
        "GOOGLE_APPLICATION_CREDENTIALS"
    )

    try:
        # -------------------------------------------------
        # PRODUCTION / RENDER
        # -------------------------------------------------

        if credentials_path:
            if not os.path.exists(
                credentials_path
            ):
                raise RuntimeError(
                    "Google credentials file was not found at "
                    f"{credentials_path}"
                )

            with open(
                credentials_path,
                "r",
                encoding="utf-8",
            ) as credential_file:
                credential_data = json.load(
                    credential_file
                )

            service_account_email = (
                credential_data.get(
                    "client_email"
                )
            )

            if not service_account_email:
                raise RuntimeError(
                    "Service-account JSON does not contain "
                    "client_email."
                )

            credentials = (
                ee.ServiceAccountCredentials(
                    service_account_email,
                    credentials_path,
                )
            )

            ee.Initialize(
                credentials=credentials,
                project=project_id,
            )

        # -------------------------------------------------
        # LOCAL DEVELOPMENT
        # -------------------------------------------------

        else:
            ee.Initialize(
                project=project_id
            )

    except Exception as exc:
        raise RuntimeError(
            "Earth Engine initialization failed: "
            f"{exc}"
        ) from exc

    _ee_initialized = True


# =========================================================
# COMMON COLLECTION
# =========================================================

def _build_no2_collection(
    *,
    latitude: float,
    longitude: float,
    days: int,
    radius_m: int,
):
    initialize_earth_engine()

    point = ee.Geometry.Point(
        [
            longitude,
            latitude,
        ]
    )

    area = point.buffer(
        radius_m
    )

    end = datetime.now(
        timezone.utc
    )

    start = end - timedelta(
        days=days
    )

    collection = (
        ee.ImageCollection(
            NO2_COLLECTION
        )
        .filterDate(
            start.strftime(
                "%Y-%m-%d"
            ),
            end.strftime(
                "%Y-%m-%d"
            ),
        )
        .filterBounds(
            area
        )
        .select(
            NO2_BAND
        )
    )

    return (
        collection,
        point,
        area,
    )


# =========================================================
# LATEST TIMESTAMP
# =========================================================

def _get_latest_timestamp(
    collection,
):
    latest_millis = (
        collection.aggregate_max(
            "system:time_start"
        ).getInfo()
    )

    if latest_millis is None:
        return None

    return datetime.fromtimestamp(
        float(
            latest_millis
        ) / 1000.0,
        tz=timezone.utc,
    ).isoformat()


# =========================================================
# SATELLITE NO2 VALUE
# =========================================================

def get_satellite_no2(
    *,
    latitude: float,
    longitude: float,
    days: int = 5,
    radius_m: int = 30000,
) -> dict:
    collection, _point, area = (
        _build_no2_collection(
            latitude=latitude,
            longitude=longitude,
            days=days,
            radius_m=radius_m,
        )
    )

    image_count = int(
        collection.size().getInfo()
    )

    if image_count <= 0:
        raise RuntimeError(
            "No Sentinel-5P NO2 images were found "
            "for the selected area and period."
        )

    mean_image = (
        collection.mean()
    )

    reduction = mean_image.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=area,
        scale=2000,
        bestEffort=True,
        maxPixels=100_000_000,
    ).getInfo()

    no2_value = reduction.get(
        NO2_BAND
    )

    if no2_value is None:
        raise RuntimeError(
            "Sentinel-5P returned no usable NO2 value "
            "for the selected area."
        )

    satellite_timestamp = (
        _get_latest_timestamp(
            collection
        )
    )

    return {
        "success": True,
        "no2": float(
            no2_value
        ),
        "unit": NO2_UNIT,
        "period_days": days,
        "radius_m": radius_m,
        "image_count": image_count,
        "satellite_timestamp":
            satellite_timestamp,
        "source": NO2_SOURCE,
    }


# =========================================================
# VISUALIZATION RANGE
# =========================================================

def _get_visualization_range(
    image,
    area,
) -> tuple[float, float]:
    percentile_data = (
        image.reduceRegion(
            reducer=ee.Reducer.percentile(
                [
                    10,
                    90,
                ]
            ),
            geometry=area,
            scale=2500,
            bestEffort=True,
            maxPixels=100_000_000,
        ).getInfo()
    )

    minimum = percentile_data.get(
        f"{NO2_BAND}_p10"
    )

    maximum = percentile_data.get(
        f"{NO2_BAND}_p90"
    )

    if (
        minimum is None
        or maximum is None
    ):
        return (
            0.0,
            0.0002,
        )

    minimum = float(
        minimum
    )

    maximum = float(
        maximum
    )

    if maximum <= minimum:
        maximum = (
            minimum
            + max(
                abs(
                    minimum
                ) * 0.10,
                0.000001,
            )
        )

    return (
        minimum,
        maximum,
    )


# =========================================================
# SOFT CIRCULAR MASK
# =========================================================

def _build_soft_circle_mask(
    *,
    point,
    radius_m: int,
):
    circle_area = (
        point.buffer(
            radius_m
        )
    )

    base_mask = (
        ee.Image.constant(
            1
        )
        .clip(
            circle_area
        )
        .unmask(
            0
        )
    )

    feather_radius = max(
        int(
            radius_m
            * 0.12
        ),
        2500,
    )

    soft_mask = (
        base_mask
        .focal_mean(
            radius=feather_radius,
            units="meters",
        )
        .clamp(
            0,
            1,
        )
    )

    return (
        circle_area,
        soft_mask,
    )


# =========================================================
# SATELLITE NO2 MAP
# =========================================================

def get_satellite_no2_map(
    *,
    latitude: float,
    longitude: float,
    days: int = 5,
    radius_m: int = 60000,
) -> dict:
    collection, point, area = (
        _build_no2_collection(
            latitude=latitude,
            longitude=longitude,
            days=days,
            radius_m=radius_m,
        )
    )

    image_count = int(
        collection.size().getInfo()
    )

    if image_count <= 0:
        raise RuntimeError(
            "No Sentinel-5P NO2 images were found "
            "for the selected area and period."
        )

    mean_image = (
        collection.mean()
        .focal_mean(
            radius=2500,
            units="meters",
        )
        .resample(
            "bilinear"
        )
    )

    minimum, maximum = (
        _get_visualization_range(
            mean_image,
            area,
        )
    )

    circle_area, soft_mask = (
        _build_soft_circle_mask(
            point=point,
            radius_m=radius_m,
        )
    )

    display_image = (
        mean_image
        .clip(
            circle_area
        )
        .updateMask(
            soft_mask
        )
    )

    visualization = {
        "min": minimum,
        "max": maximum,
        "palette":
            NO2_PALETTE,
    }

    map_data = (
        display_image.getMapId(
            visualization
        )
    )

    tile_fetcher = (
        map_data.get(
            "tile_fetcher"
        )
    )

    if tile_fetcher is None:
        raise RuntimeError(
            "Earth Engine did not return a tile fetcher."
        )

    tile_url = getattr(
        tile_fetcher,
        "url_format",
        None,
    )

    if not tile_url:
        raise RuntimeError(
            "Earth Engine did not return a tile URL."
        )

    satellite_timestamp = (
        _get_latest_timestamp(
            collection
        )
    )

    return {
        "success": True,
        "tile_url":
            tile_url,
        "center": {
            "latitude":
                latitude,
            "longitude":
                longitude,
        },
        "period_days":
            days,
        "radius_m":
            radius_m,
        "image_count":
            image_count,
        "satellite_timestamp":
            satellite_timestamp,
        "visualization": {
            "min":
                minimum,
            "max":
                maximum,
            "unit":
                NO2_UNIT,
        },
        "source":
            NO2_SOURCE,
    }