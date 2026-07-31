import time
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.auth import get_current_user
from app.models.enums import ExportStatus, PlanType
from app.schemas.user import UserProfile
from app.services.credit_service import _credits_store, CreditService
from app.services.entitlement_service import EntitlementService
from app.services.ffmpeg_service import FFmpegService
from app.models.credit import CreditModel
from app.models.profile import utc_now

client = TestClient(app)

USER_ID = "00000000-0000-0000-0000-000000000001"
user_profile = UserProfile(id=USER_ID, email="test@example.com", full_name="Export Tester")


def mock_get_current_user():
    return user_profile


@pytest.fixture(autouse=True)
def override_auth_and_credits():
    app.dependency_overrides[get_current_user] = mock_get_current_user
    # Seed user credits with 500 balance
    now = utc_now()
    _credits_store[USER_ID] = CreditModel(
        id=uuid4(),
        user_id=uuid4(),
        balance=500,
        last_reset=now,
        credit_mode="standard",
        created_at=now,
        updated_at=now,
    )
    yield
    app.dependency_overrides.clear()


def test_ffmpeg_service_resolution_and_bitrate_parsing():
    """Test FFmpegService resolution dimensions and bitrate presets."""
    service = FFmpegService()
    assert service.parse_resolution("720p") == (1280, 720)
    assert service.parse_resolution("1080p") == (1920, 1080)
    assert service.parse_resolution("4K") == (3840, 2160)
    assert service.parse_bitrate("1080p", "standard") == "6M"


def test_create_export_job_success():
    """Test creating an export job returns HTTP 201 with queued status."""
    project_id = str(uuid4())
    payload = {
        "project_id": project_id,
        "title": "My Test Render",
        "timeline_json": {"duration": 2.0},
        "settings": {
            "resolution": "720p",
            "fps": 30,
            "format": "mp4",
            "watermark": True,
        },
    }

    response = client.post("/exports", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["project_id"] == project_id
    assert data["resolution"] == "720p"
    assert data["status"] in ("queued", "rendering", "completed")
    assert "id" in data


def test_export_status_polling_and_download():
    """Test polling export status and fetching download URL upon completion."""
    project_id = str(uuid4())
    payload = {
        "project_id": project_id,
        "settings": {"resolution": "720p", "watermark": True},
    }

    create_res = client.post("/exports", json=payload)
    assert create_res.status_code == 201
    export_id = create_res.json()["id"]

    # Poll status
    status_res = client.get(f"/exports/{export_id}/status")
    assert status_res.status_code == 200
    assert "progress" in status_res.json()

    # Wait briefly for background rendering task completion
    time.sleep(0.5)

    get_res = client.get(f"/exports/{export_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == export_id


def test_export_resolution_permission_check():
    """Test requesting a resolution higher than plan limit fails with HTTP 403."""
    project_id = str(uuid4())

    # Default plan is FREE (max 720p). Requesting 4K should fail.
    payload = {
        "project_id": project_id,
        "settings": {"resolution": "4K", "watermark": True},
    }

    response = client.post("/exports", json=payload)
    assert response.status_code == 403
    err_msg = response.json().get("message") or response.json().get("error")
    assert "exceeds your plan maximum allowed resolution" in err_msg


def test_export_watermark_permission_check():
    """Test removing watermark on FREE plan fails with HTTP 403."""
    project_id = str(uuid4())

    payload = {
        "project_id": project_id,
        "settings": {"resolution": "720p", "watermark": False},
    }

    response = client.post("/exports", json=payload)
    assert response.status_code == 403
    err_msg = response.json().get("message") or response.json().get("error")
    assert "Watermark removal is not allowed" in err_msg


def test_export_insufficient_credits():
    """Test export fails with HTTP 402 if user has insufficient credits."""
    # Set user balance to 0 credits
    now = utc_now()
    _credits_store[USER_ID] = CreditModel(
        id=uuid4(),
        user_id=uuid4(),
        balance=0,
        last_reset=now,
        credit_mode="standard",
        created_at=now,
        updated_at=now,
    )

    project_id = str(uuid4())
    payload = {
        "project_id": project_id,
        "settings": {"resolution": "720p", "watermark": True},
    }

    response = client.post("/exports", json=payload)
    assert response.status_code == 402
    err_msg = response.json().get("message") or response.json().get("error")
    assert "Insufficient credits" in err_msg


def test_cancel_export():
    """Test cancelling an export job."""
    project_id = str(uuid4())
    create_res = client.post(
        "/exports",
        json={"project_id": project_id, "settings": {"resolution": "720p", "watermark": True}},
    )
    export_id = create_res.json()["id"]

    cancel_res = client.delete(f"/exports/{export_id}")
    assert cancel_res.status_code == 200
    assert cancel_res.json()["success"] is True

    get_res = client.get(f"/exports/{export_id}")
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "cancelled"
