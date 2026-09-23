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

    ee.Initialize(
        project=project_id
    )

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
    timestamp_ms = (
        collection
        .aggregate_max(
            "system:time_start"
        )
        .getInfo()
    )

    if not timestamp_ms:
        return None

    return (
        datetime.fromtimestamp(
            timestamp_ms / 1000,
            tz=timezone.utc,
        )
        .isoformat()
    )


# =========================================================
# NUMERIC SATELLITE NO2
# =========================================================

def get_satellite_no2(
    *,
    latitude: float,
    longitude: float,
    days: int = 5,
    radius_m: int = 30000,
) -> dict:
    initialize_earth_engine()

    (
        collection,
        _,
        area,
    ) = _build_no2_collection(
        latitude=latitude,
        longitude=longitude,
        days=days,
        radius_m=radius_m,
    )

    image_count = (
        collection
        .size()
        .getInfo()
    )

    if image_count == 0:
        return {
            "success": False,
            "no2": None,
            "unit": "mol/m^2",
            "period_days": days,
            "radius_m": radius_m,
            "image_count": 0,
            "satellite_timestamp": None,
            "source":
                "Sentinel-5P / Google Earth Engine",
            "message":
                "No recent Sentinel-5P NO2 data found.",
        }

    mean_image = (
        collection.mean()
    )

    result = (
        mean_image.reduceRegion(
            reducer=
                ee.Reducer.mean(),

            geometry=
                area,

            scale=
                2000,

            bestEffort=
                True,

            maxPixels=
                10000000,
        )
        .getInfo()
    )

    no2 = result.get(
        NO2_BAND
    )

    return {
        "success":
            no2 is not None,

        "no2":
            no2,

        "unit":
            "mol/m^2",

        "period_days":
            days,

        "radius_m":
            radius_m,

        "image_count":
            image_count,

        "satellite_timestamp":
            _get_latest_timestamp(
                collection
            ),

        "source":
            "Sentinel-5P / Google Earth Engine",
    }


# =========================================================
# FEATHER / SOFT CIRCLE MASK
# =========================================================

def _build_feather_mask(
    point,
):
    """
    Creates a circular alpha mask.

    Outer area = transparent.
    Center area = stronger.
    Intermediate rings create a soft fade.
    """

    rings = [
        (60000, 0.08),
        (57000, 0.15),
        (54000, 0.25),
        (50000, 0.38),
        (46000, 0.52),
        (42000, 0.67),
        (38000, 0.80),
        (34000, 0.90),
        (30000, 1.00),
    ]

    feather_mask = (
        ee.Image.constant(0)
    )

    for radius, opacity in rings:
        ring_image = (
            ee.Image.constant(
                opacity
            )
            .clip(
                point.buffer(
                    radius
                )
            )
            .unmask(0)
        )

        feather_mask = (
            feather_mask.max(
                ring_image
            )
        )

    # Smooth boundaries between rings
    feather_mask = (
        feather_mask
        .focal_mean(
            radius=2500,
            units="meters",
        )
        .clamp(
            0,
            1,
        )
    )

    return feather_mask


# =========================================================
# SATELLITE NO2 HEATMAP
# =========================================================

def get_satellite_no2_map(
    *,
    latitude: float,
    longitude: float,
    days: int = 5,
    radius_m: int = 60000,
) -> dict:
    initialize_earth_engine()

    (
        collection,
        point,
        analysis_area,
    ) = _build_no2_collection(
        latitude=latitude,
        longitude=longitude,
        days=days,
        radius_m=radius_m,
    )

    image_count = (
        collection
        .size()
        .getInfo()
    )

    if image_count == 0:
        return {
            "success": False,
            "tile_url": None,
            "message":
                "No recent Sentinel-5P NO2 data found.",
        }


    # =====================================================
    # 5-DAY MEAN
    # =====================================================

    mean_image = (
        collection.mean()
    )


    # =====================================================
    # SMOOTH RAW SATELLITE PIXELS
    # =====================================================

    smooth_image = (
        mean_image
        .focal_mean(
            radius=2500,
            units="meters",
        )
        .resample(
            "bilinear"
        )
    )


    # =====================================================
    # DYNAMIC LOCAL COLOR RANGE
    # =====================================================

    stats = (
        smooth_image.reduceRegion(
            reducer=
                ee.Reducer.percentile(
                    [
                        10,
                        90,
                    ]
                ),

            geometry=
                analysis_area,

            scale=
                4000,

            bestEffort=
                True,

            maxPixels=
                10000000,
        )
        .getInfo()
    )


    minimum = stats.get(
        f"{NO2_BAND}_p10"
    )

    maximum = stats.get(
        f"{NO2_BAND}_p90"
    )


    if minimum is None:
        minimum = 0.0

    if maximum is None:
        maximum = 0.0001

    if maximum <= minimum:
        maximum = (
            minimum +
            0.00001
        )


    # =====================================================
    # VISUALIZE NO2
    # =====================================================

    visualized_image = (
        smooth_image.visualize(
            min=minimum,
            max=maximum,
            palette=[
                "0015ff",
                "005cff",
                "00bfff",
                "00ffff",
                "00ff88",
                "7dff00",
                "ffff00",
                "ffb000",
                "ff6600",
                "ff0000",
            ],
        )
    )


    # =====================================================
    # SOFT CIRCULAR ALPHA MASK
    # =====================================================

    feather_mask = (
        _build_feather_mask(
            point
        )
    )


    final_image = (
        visualized_image
        .updateMask(
            feather_mask
        )
    )


    # =====================================================
    # TILE URL
    # =====================================================

    map_info = (
        final_image
        .getMapId()
    )


    tile_fetcher = (
        map_info.get(
            "tile_fetcher"
        )
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


    # =====================================================
    # RESPONSE
    # =====================================================

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
            _get_latest_timestamp(
                collection
            ),

        "visualization": {
            "min":
                minimum,

            "max":
                maximum,

            "unit":
                "mol/m^2",

            "style":
                "soft_circular_heatmap",
        },

        "source":
            "Sentinel-5P / Google Earth Engine",
    }