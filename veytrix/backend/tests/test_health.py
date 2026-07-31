from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    """Test that GET /health returns HTTP 200 and expected payload."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Backend"
    assert data["version"] == "1.0.0"
    assert "supabase" in data



def test_custom_exception_handler():
    """Test that non-existent routes return 404 with custom error format."""
    response = client.get("/non-existent-route")
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert data["status"] == 404
    assert "error" in data
