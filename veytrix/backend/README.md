# VEYTRIX Production-Ready FastAPI Backend

Production-grade modular FastAPI backend architecture for the VEYTRIX Platform.

## Backend Overview

This backend is built with FastAPI, Pydantic v2, Pydantic-Settings, and Uvicorn. It provides a modular, maintainable foundation featuring:
- **Lifespan Management**: Graceful application startup and shutdown lifecycle management.
- **Centralized Configuration**: Strict environment settings powered by `pydantic-settings`.
- **Reusable Logging**: Standardized application logging supporting `DEBUG`, `INFO`, `WARNING`, `ERROR`, and `CRITICAL` levels.
- **CORS Support**: Environment-configurable origin filtering for cross-origin request security.
- **Global Error Handling**: Standardized JSON error response format across HTTP, validation, and unhandled system errors.
- **Modular Routing**: Clear separation between API routes, schemas, services, models, and middleware.

---

## Directory Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py
│   │   └── endpoints/
│   │       ├── __init__.py
│   │       └── health.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── logging.py
│   ├── database/
│   │   └── __init__.py
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── exception_handler.py
│   ├── models/
│   │   └── __init__.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── health.py
│   ├── services/
│   │   └── __init__.py
│   └── utils/
│       └── __init__.py
├── tests/
│   ├── __init__.py
│   └── test_health.py
├── main.py
├── requirements.txt
├── .env.example
└── README.md
```

---

## Installation & Setup

### 1. Create Virtual Environment

Create and activate a Python virtual environment:

```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

Install the foundation dependencies listed in `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and adjust configuration variables as needed:

```bash
cp .env.example .env
```

---

## Running FastAPI Server

Start the production-ready FastAPI development server:

```bash
# Using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or execute main.py directly
python main.py
```

- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Docs (Swagger UI): `http://localhost:8000/docs`
- Alternative API Docs (ReDoc): `http://localhost:8000/redoc`

---

## Health API Endpoint

### `GET /health`

Checks backend service health status.

#### Response (`HTTP 200 OK`):
```json
{
  "status": "healthy",
  "service": "Backend",
  "version": "1.0.0"
}
```

---

## Running Tests

Execute the unit test suite with `pytest`:

```bash
pytest
```
