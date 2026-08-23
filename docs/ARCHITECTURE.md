# Architecture

The platform is split into a FastAPI backend, AI/ML workloads, and a React frontend. Integration boundaries are documented here as services are implemented.

# System Architecture

## Overview

AirGuard AI is organized into three main layers:

```text
Tirth Frontend
      ↓
Vaibhav Backend
      ↓
Parth AI / ML

                   🌍 AirGuard AI
                         │
                         ▼
               ┌──────────────────┐
               │  Tirth Frontend  │
               │   React / Vite   │
               └────────┬─────────┘
                        │
                   REST / WebSocket
                        │
                        ▼
               ┌──────────────────┐
               │ Vaibhav Backend  │
               │ FastAPI + Cloud  │
               └───────┬──────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
     Firestore     Parth AI/ML   AI Services
                       │
              ┌────────┼────────┐
              │        │        │
              ▼        ▼        ▼
          Forecast   Source   Gemini /
             ML      ML       Vision