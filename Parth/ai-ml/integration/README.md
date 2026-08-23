# Parth AI/ML Integration Layer

This directory provides the stable public interface between
the AI/ML modules and the backend.

Backend developers should import functions from `integration`
instead of importing internal AI/ML modules directly.

## Public interfaces

### Forecast
run_forecast(records)

### Source Detection
run_source_detection(data)

### Gemini Analysis
run_air_quality_analysis(...)

### Gemini Forecast Explanation
run_forecast_explanation(...)

### Gemini Chat
run_chat(...)

### Vision
run_evidence_analysis(image_path)

Do not change the public function names or output structure
without updating docs/API_CONTRACT.md and coordinating with
the backend team.