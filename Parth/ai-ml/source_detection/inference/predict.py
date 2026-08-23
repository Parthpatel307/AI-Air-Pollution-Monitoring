from typing import Dict, List


def detect_sources(data: Dict) -> Dict:
    pm25 = float(data["pm25"])
    pm10 = float(data["pm10"])
    no2 = float(data["no2"])
    so2 = float(data["so2"])
    co = float(data["co"])
    wind_speed = float(data["wind_speed"])

    candidates: List[Dict] = []

    if no2 >= 40 and pm25 >= 50:
        confidence = 0.70

        if wind_speed < 4:
            confidence += 0.08

        candidates.append(
            {
                "source": "VEHICLE_TRAFFIC",
                "confidence": min(
                    confidence,
                    0.95,
                ),
            }
        )

    if pm10 >= 100 and pm10 > pm25 * 1.5:
        candidates.append(
            {
                "source": "ROAD_DUST",
                "confidence": 0.65,
            }
        )

    if so2 >= 20 and co >= 1.0:
        candidates.append(
            {
                "source": "COMBUSTION_INDUSTRIAL",
                "confidence": 0.72,
            }
        )

    if pm25 >= 100 and co >= 1.2:
        candidates.append(
            {
                "source": "BIOMASS_BURNING",
                "confidence": 0.68,
            }
        )

    if wind_speed < 2.5 and pm25 >= 70:
        candidates.append(
            {
                "source": "POLLUTION_ACCUMULATION",
                "confidence": 0.60,
            }
        )

    if not candidates:
        candidates.append(
            {
                "source": "UNKNOWN",
                "confidence": 0.30,
            }
        )

    candidates.sort(
        key=lambda item: item["confidence"],
        reverse=True,
    )

    return {
        "probable_sources": candidates[:3],
        "explanation": (
            "Source attribution is based on pollutant "
            "patterns and weather conditions."
        ),
        "method": "RULE_BASED_BASELINE",
    }