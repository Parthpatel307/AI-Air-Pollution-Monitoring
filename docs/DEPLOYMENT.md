# Deployment

## Overview

AirGuard AI is designed as a modular web application with a separate frontend, backend, database, and AI/ML layer.

```text
User
  ↓
React / Vite Frontend
  ↓
FastAPI Backend
  ├── Firebase Authentication
  ├── Firestore
  ├── AI/ML Integration
  └── WebSocket
        ↓
Parth AI/ML
  ├── AQI Forecasting
  ├── Source Detection
  ├── Gemini
  └── Vision