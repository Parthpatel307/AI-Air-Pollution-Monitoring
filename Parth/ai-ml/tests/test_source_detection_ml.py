from source_detection.inference.ml_predict import predict_source


def test_ml_source_prediction():
    data = {
        "pm25": 75,
        "pm10": 100,
        "no2": 58,
        "so2": 10,
        "co": 0.9,
        "temperature": 30,
        "humidity": 60,
        "wind_speed": 5,
    }

    result = predict_source(data)

    assert "probable_sources" in result
    assert len(result["probable_sources"]) == 3
    assert "top_source" in result
    assert "top_confidence" in result
    assert result["method"] == "RANDOM_FOREST"