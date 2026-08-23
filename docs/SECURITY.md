# Security

## Security Principles

AirGuard AI follows a security-first approach across the frontend, backend, database, AI/ML layer, and deployment environment.

The main principle is:

> **Secrets stay private, permissions stay server-side, and sensitive data stays protected.**

---

## 🔐 Secrets & Credentials

Never commit sensitive credentials to Git.

Do not commit:

```text
.env
API keys
Gemini credentials
Firebase Admin credentials
Service-account JSON
Private keys
Cloud credentials