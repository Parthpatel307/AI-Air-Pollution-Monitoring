from source_detection.inference.predict import detect_sources


def test_source_detection_vehicle():
    data = {
        "pm25": 75,
        "pm10": 95,
        "no2": 55,
        "so2": 10,
        "co": 0.8,
        "temperature": 31,
        "humidity": 60,
        "wind_speed": 3.5,
    }

    result = detect_sources(data)

    assert "probable_sources" in result
    assert len(result["probable_sources"]) > 0
    assert result["probable_sources"][0]["source"] == "VEHICLE_TRAFFIC"


def test_source_detection_unknown():
    data = {
        "pm25": 20,
        "pm10": 25,
        "no2": 10,
        "so2": 5,
        "co": 0.2,
        "temperature": 25,
        "humidity": 50,
        "wind_speed": 10,
    }

    result = detect_sources(data)

    assert result["probable_sources"][0]["source"] == "UNKNOWN"