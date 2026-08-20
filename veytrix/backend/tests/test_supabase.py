from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from main import app
from app.core.supabase import get_supabase_admin_client, get_supabase_client, init_supabase_client
from app.services.supabase_service import (
    check_auth_connection,
    check_database_connection,
    check_storage_connection,
    check_supabase_client,
    get_supabase_health_status,
)

client = TestClient(app)


def test_supabase_client_unconfigured(monkeypatch):
    """Test Supabase client returns None when unconfigured."""
    with patch("app.core.supabase._supabase_client", None):
        monkeypatch.setattr("app.core.config.settings.SUPABASE_URL", "")
        monkeypatch.setattr("app.core.config.settings.SUPABASE_ANON_KEY", "")
        monkeypatch.setattr("app.core.config.settings.SUPABASE_SERVICE_ROLE_KEY", "")

        sb_client = init_supabase_client()
        assert sb_client is None
        assert get_supabase_client() is None


def test_supabase_admin_client_unconfigured(monkeypatch):
    """Test Supabase admin client returns None when service role key is unconfigured."""
    with patch("app.core.supabase._supabase_admin_client", None):
        monkeypatch.setattr("app.core.config.settings.SUPABASE_URL", "")
        monkeypatch.setattr("app.core.config.settings.SUPABASE_SERVICE_ROLE_KEY", "")

        admin_client = get_supabase_admin_client()
        assert admin_client is None


def test_supabase_client_mock_initialization(monkeypatch):
    """Test Supabase client initializes when credentials are provided."""
    mock_sb_instance = MagicMock()
    with patch("app.core.supabase._supabase_client", None), patch(
        "app.core.supabase.create_client", return_value=mock_sb_instance
    ) as mock_create:
        monkeypatch.setattr("app.core.config.settings.SUPABASE_URL", "https://example.supabase.co")
        monkeypatch.setattr("app.core.config.settings.SUPABASE_ANON_KEY", "anon-key-123")

        sb_client = get_supabase_client()
        assert sb_client == mock_sb_instance
        mock_create.assert_called_once_with("https://example.supabase.co", "anon-key-123")


def test_supabase_service_connectivity_checks(monkeypatch):
    """Test database, storage, and auth connection service checks with mocked responses."""
    mock_sb = MagicMock()
    # Mock postgrest REST API reachability
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_sb.postgrest.session.get.return_value = mock_response

    # Mock storage buckets list
    mock_sb.storage.list_buckets.return_value = []

    with patch("app.services.supabase_service.init_supabase_client", return_value=mock_sb):
        monkeypatch.setattr("app.core.config.settings.SUPABASE_URL", "https://example.supabase.co")
        monkeypatch.setattr("app.core.config.settings.SUPABASE_ANON_KEY", "anon-key-123")

        client_status = check_supabase_client()
        assert client_status["configured"] is True
        assert client_status["initialized"] is True

        db_status = check_database_connection()
        assert db_status["connected"] is True
        assert db_status["status"] == "connected"

        storage_status = check_storage_connection()
        assert storage_status["connected"] is True
        assert storage_status["bucket_count"] == 0

        auth_status = check_auth_connection()
        assert auth_status["connected"] is True
        assert auth_status["status"] == "connected"

        overall_health = get_supabase_health_status()
        assert "client" in overall_health
        assert "database" in overall_health
        assert "storage" in overall_health
        assert "auth" in overall_health


def test_health_endpoint_response():
    """Test health endpoint includes supabase connection status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Backend"
    assert "supabase" in data
