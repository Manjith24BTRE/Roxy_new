import time
from unittest.mock import MagicMock, patch
import jwt
from fastapi.testclient import TestClient
from main import app
from app.schemas.user import UserProfile
from app.services.profile_service import sync_user_profile

client = TestClient(app)

SECRET_KEY = "test-secret-key-12345"


def create_test_token(sub: str = "user-123", email: str = "user@example.com", expires_in: int = 3600) -> str:
    """Helper function to create a test JWT token."""
    payload = {
        "sub": sub,
        "email": email,
        "role": "authenticated",
        "exp": int(time.time()) + expires_in,
        "user_metadata": {"full_name": "Test User", "avatar_url": "https://example.com/avatar.png"},
        "app_metadata": {"provider": "email"},
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def test_public_route_accessible():
    """Test that public endpoints like GET /health remain accessible without authentication."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_protected_route_missing_token():
    """Test that GET /auth/me rejects unauthenticated requests with 401 UNAUTHORIZED."""
    response = client.get("/auth/me")
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "UNAUTHORIZED"
    assert data["message"] == "Authentication required."


def test_protected_route_invalid_token():
    """Test that GET /auth/me rejects invalid access tokens with 401 INVALID_TOKEN."""
    headers = {"Authorization": "Bearer invalid.malformed.token"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "INVALID_TOKEN"


def test_protected_route_expired_token():
    """Test that GET /auth/me rejects expired access tokens with 401 INVALID_TOKEN."""
    expired_token = create_test_token(expires_in=-3600)
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "INVALID_TOKEN"


def test_protected_route_valid_token(monkeypatch):
    """Test that GET /auth/me returns user payload when supplied a valid token."""
    valid_token = create_test_token(sub="usr-999", email="valid@example.com")
    headers = {"Authorization": f"Bearer {valid_token}"}

    monkeypatch.setattr("app.core.config.settings.JWT_SECRET", SECRET_KEY)

    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["id"] == "usr-999"
    assert data["user"]["email"] == "valid@example.com"
    assert data["user"]["full_name"] == "Test User"


def test_profile_synchronization_logic():
    """Test user profile synchronization service."""
    user = UserProfile(
        id="usr-sync-1",
        email="sync@example.com",
        full_name="Sync User",
        avatar_url="https://example.com/avatar.jpg",
    )

    # First sync creates/caches profile
    synced_user_1 = sync_user_profile(user)
    assert synced_user_1.id == "usr-sync-1"
    assert synced_user_1.email == "sync@example.com"

    # Second sync reuses existing profile without duplicate creation
    synced_user_2 = sync_user_profile(user)
    assert synced_user_2.id == "usr-sync-1"
