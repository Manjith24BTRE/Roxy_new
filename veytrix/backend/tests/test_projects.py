import time
import jwt
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SECRET_KEY = "test-secret-key-12345"


def create_token(user_id: str = "user-100") -> str:
    """Helper to generate JWT bearer tokens for tests."""
    payload = {
        "sub": user_id,
        "email": f"{user_id}@example.com",
        "role": "authenticated",
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def test_unauthenticated_project_access():
    """Test that project endpoints require authentication (401)."""
    res = client.get("/projects")
    assert res.status_code == 401
    assert res.json()["error"] == "UNAUTHORIZED"


def test_create_and_get_project(monkeypatch):
    """Test project creation and retrieval with ownership verification."""
    token = create_token("user-owner-1")
    headers = {"Authorization": f"Bearer {token}"}
    monkeypatch.setattr("app.core.config.settings.JWT_SECRET", SECRET_KEY)

    # 1. Create project
    create_res = client.post(
        "/projects",
        headers=headers,
        json={
            "title": "Promo Video",
            "aspect_ratio": "16:9",
            "timeline_json": {"tracks": [{"id": "track-1"}]},
        },
    )
    assert create_res.status_code == 201
    data = create_res.json()
    assert data["success"] is True
    project_id = data["project"]["id"]
    assert data["project"]["title"] == "Promo Video"
    assert data["project"]["timeline_json"] == {"tracks": [{"id": "track-1"}]}

    # 2. Get project as owner
    get_res = client.get(f"/projects/{project_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["project"]["id"] == project_id

    # 3. Attempt get project as another user (404 Unauthorized)
    other_token = create_token("user-attacker")
    other_headers = {"Authorization": f"Bearer {other_token}"}
    unauth_res = client.get(f"/projects/{project_id}", headers=other_headers)
    assert unauth_res.status_code == 404
    assert unauth_res.json()["error"] == "NOT_FOUND"


def test_list_projects_search_and_pagination(monkeypatch):
    """Test listing projects with search by title, status filter, and pagination."""
    token = create_token("user-lister")
    headers = {"Authorization": f"Bearer {token}"}
    monkeypatch.setattr("app.core.config.settings.JWT_SECRET", SECRET_KEY)

    client.post("/projects", headers=headers, json={"title": "Alpha Video"})
    client.post("/projects", headers=headers, json={"title": "Beta Intro"})
    client.post("/projects", headers=headers, json={"title": "Gamma Outro"})

    # List all
    res = client.get("/projects?limit=10", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 3

    # Search filter
    search_res = client.get("/projects?search=Beta", headers=headers)
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert len(search_data["projects"]) == 1
    assert search_data["projects"][0]["title"] == "Beta Intro"


def test_rename_and_autosave(monkeypatch):
    """Test project title rename and timeline autosave."""
    token = create_token("user-editor")
    headers = {"Authorization": f"Bearer {token}"}
    monkeypatch.setattr("app.core.config.settings.JWT_SECRET", SECRET_KEY)

    c_res = client.post("/projects", headers=headers, json={"title": "Original Title"})
    p_id = c_res.json()["project"]["id"]

    # Rename
    r_res = client.patch(f"/projects/{p_id}/rename", headers=headers, json={"title": "Renamed Title"})
    assert r_res.status_code == 200
    assert r_res.json()["project"]["title"] == "Renamed Title"

    # Empty title rename fails
    r_err = client.patch(f"/projects/{p_id}/rename", headers=headers, json={"title": "   "})
    assert r_err.status_code == 422

    # Autosave timeline
    new_timeline = {"tracks": [], "assets": ["a1"]}
    a_res = client.post(
        f"/projects/{p_id}/autosave",
        headers=headers,
        json={"timeline_json": new_timeline, "duration": 12.5},
    )
    assert a_res.status_code == 200
    assert a_res.json()["project"]["timeline_json"] == new_timeline
    assert a_res.json()["project"]["duration"] == 12.5


def test_duplicate_project(monkeypatch):
    """Test project cloning / duplication."""
    token = create_token("user-duplicator")
    headers = {"Authorization": f"Bearer {token}"}
    monkeypatch.setattr("app.core.config.settings.JWT_SECRET", SECRET_KEY)

    c_res = client.post("/projects", headers=headers, json={"title": "Master Project", "duration": 45.0})
    p_id = c_res.json()["project"]["id"]

    dup_res = client.post(f"/projects/{p_id}/duplicate", headers=headers)
    assert dup_res.status_code == 201
    dup_data = dup_res.json()["project"]
    assert dup_data["id"] != p_id
    assert dup_data["title"] == "Copy of Master Project"
    assert dup_data["duration"] == 45.0


def test_archive_restore_and_delete(monkeypatch):
    """Test project archiving, restoring, soft delete, and permanent delete."""
    token = create_token("user-lifecycle")
    headers = {"Authorization": f"Bearer {token}"}
    monkeypatch.setattr("app.core.config.settings.JWT_SECRET", SECRET_KEY)

    c_res = client.post("/projects", headers=headers, json={"title": "Lifecycle Project"})
    p_id = c_res.json()["project"]["id"]

    # Archive
    arc_res = client.post(f"/projects/{p_id}/archive", headers=headers)
    assert arc_res.status_code == 200
    assert arc_res.json()["project"]["status"] == "archived"

    # Soft delete
    del_res = client.delete(f"/projects/{p_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["project"]["deleted_at"] is not None

    # Fetch soft deleted -> 404
    get_del = client.get(f"/projects/{p_id}", headers=headers)
    assert get_del.status_code == 404

    # Restore
    res_res = client.post(f"/projects/{p_id}/restore", headers=headers)
    assert res_res.status_code == 200
    assert res_res.json()["project"]["deleted_at"] is None
    assert res_res.json()["project"]["status"] == "draft"

    # Permanent delete
    perm_res = client.delete(f"/projects/{p_id}/permanent", headers=headers)
    assert perm_res.status_code == 200

    # Fetch permanent deleted -> 404
    get_perm = client.get(f"/projects/{p_id}", headers=headers)
    assert get_perm.status_code == 404
