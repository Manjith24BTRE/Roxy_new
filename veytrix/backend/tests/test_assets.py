import io
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.auth import get_current_user
from app.models.enums import AssetType, PlanType
from app.schemas.user import UserProfile

client = TestClient(app)

# Dummy test users
USER_1_ID = "00000000-0000-0000-0000-000000000001"
USER_2_ID = "00000000-0000-0000-0000-000000000002"

user_1 = UserProfile(id=USER_1_ID, email="user1@example.com", full_name="User One")
user_2 = UserProfile(id=USER_2_ID, email="user2@example.com", full_name="User Two")


def mock_get_user_1():
    return user_1


def mock_get_user_2():
    return user_2


@pytest.fixture(autouse=True)
def override_auth_dependency():
    app.dependency_overrides[get_current_user] = mock_get_user_1
    yield
    app.dependency_overrides.clear()


def test_upload_image_asset_success():
    """Test uploading an image file asset successfully."""
    image_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
    file = ("sample.png", io.BytesIO(image_content), "image/png")

    response = client.post(
        "/assets/upload",
        files={"file": file},
        data={"asset_type": "IMAGE", "name": "Sample Banner", "category": "Banner"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Sample Banner"
    assert data["type"] == "IMAGE"
    assert data["category"] == "Banner"
    assert data["status"] == "ready"
    assert data["storage_path"] is not None
    assert "image" in data["storage_path"] or USER_1_ID in data["storage_path"]


def test_upload_invalid_file_type_fails():
    """Test uploading an unsupported content-type fails with HTTP 400."""
    invalid_file = ("script.exe", io.BytesIO(b"binary content"), "application/x-msdownload")

    response = client.post(
        "/assets/upload",
        files={"file": invalid_file},
        data={"asset_type": "IMAGE"},
    )
    assert response.status_code == 400
    err_msg = response.json().get("message") or response.json().get("error")
    assert "Invalid file type" in err_msg


def test_upload_exceeds_file_size_limit_fails():
    """Test uploading file exceeding size limit fails with HTTP 400."""
    # 11MB file exceeding 10MB image limit
    oversized = io.BytesIO(b"0" * (11 * 1024 * 1024))
    file = ("large.jpg", oversized, "image/jpeg")

    response = client.post(
        "/assets/upload",
        files={"file": file},
        data={"asset_type": "IMAGE"},
    )
    assert response.status_code == 400
    err_msg = response.json().get("message") or response.json().get("error")
    assert "exceeds maximum limit" in err_msg


def test_create_asset_metadata_and_get():
    """Test creating asset metadata entry and retrieving it by ID."""
    payload = {
        "name": "Background Track",
        "type": "AUDIO",
        "category": "Ambient",
        "required_plan": "PRO",
        "duration": 180.5,
        "metadata_json": {"bitrate": "320kbps"},
    }

    create_res = client.post("/assets/metadata", json=payload)
    assert create_res.status_code == 201
    asset_id = create_res.json()["id"]

    get_res = client.get(f"/assets/{asset_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == asset_id
    assert data["name"] == "Background Track"
    assert data["duration"] == 180.5
    assert data["required_plan"] == "PRO"


def test_list_assets_with_filters_and_pagination():
    """Test listing user assets with category filter, search, and pagination."""
    # Seed 3 assets
    for i in range(3):
        client.post(
            "/assets/metadata",
            json={"name": f"Cinematic Video {i}", "type": "VIDEO", "category": "Cinematic"},
        )

    response = client.get("/assets?asset_type=VIDEO&category=Cinematic&page=1&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["page"] == 1
    assert data["limit"] == 2
    assert len(data["assets"]) <= 2


def test_list_effects_catalog_450_items():
    """Test effects catalog returns 450 total items with entitlement flags."""
    response = client.get("/assets/effects?page=1&limit=50")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total"] == 450
    assert len(data["items"]) == 50
    item = data["items"][0]
    assert item["type"] == "EFFECT"
    assert "user_has_access" in item


def test_list_filters_catalog_200_items():
    """Test filters catalog returns 200 total items."""
    response = client.get("/assets/filters?page=1&limit=20")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total"] == 200
    assert len(data["items"]) == 20


def test_list_transitions_catalog_200_items():
    """Test transitions catalog returns 200 total items."""
    response = client.get("/assets/transitions?page=1&limit=20")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total"] == 200
    assert len(data["items"]) == 20


def test_update_asset_metadata():
    """Test updating asset metadata."""
    create_res = client.post("/assets/metadata", json={"name": "Old Asset", "type": "IMAGE"})
    asset_id = create_res.json()["id"]

    update_res = client.patch(
        f"/assets/{asset_id}",
        json={"name": "New Updated Asset", "category": "Refactored"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "New Updated Asset"
    assert update_res.json()["category"] == "Refactored"


def test_delete_asset_success():
    """Test deleting asset."""
    create_res = client.post("/assets/metadata", json={"name": "Temporary Asset", "type": "IMAGE"})
    asset_id = create_res.json()["id"]

    del_res = client.delete(f"/assets/{asset_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Subsequent GET returns 404
    get_res = client.get(f"/assets/{asset_id}")
    assert get_res.status_code == 404


def test_asset_ownership_isolation():
    """Test user cannot update or delete assets owned by another user."""
    create_res = client.post("/assets/metadata", json={"name": "User 1 Asset", "type": "IMAGE"})
    asset_id = create_res.json()["id"]

    # Switch auth to User 2
    app.dependency_overrides[get_current_user] = mock_get_user_2

    update_res = client.patch(f"/assets/{asset_id}", json={"name": "Hacked Asset"})
    assert update_res.status_code == 403

    del_res = client.delete(f"/assets/{asset_id}")
    assert del_res.status_code == 403
