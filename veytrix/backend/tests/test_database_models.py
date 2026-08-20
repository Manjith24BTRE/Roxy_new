from pathlib import Path
from uuid import uuid4
from app.models import (
    AssetModel,
    AssetType,
    CreditModel,
    ExportModel,
    ExportStatus,
    PlanType,
    ProfileModel,
    ProjectModel,
    ProjectStatus,
    SubscriptionModel,
    SubscriptionStatus,
)


def test_profile_model_creation():
    """Test ProfileModel fields and defaults."""
    u_id = uuid4()
    profile = ProfileModel(user_id=u_id, display_name="John Doe", avatar_url="https://example.com/pic.jpg")
    assert profile.user_id == u_id
    assert profile.display_name == "John Doe"
    assert profile.avatar_url == "https://example.com/pic.jpg"
    assert profile.id is not None


def test_project_model_creation():
    """Test ProjectModel fields, defaults, and ProjectStatus enum."""
    u_id = uuid4()
    project = ProjectModel(user_id=u_id, title="My First Project")
    assert project.user_id == u_id
    assert project.title == "My First Project"
    assert project.status == ProjectStatus.DRAFT
    assert isinstance(project.timeline_json, dict)
    assert project.deleted_at is None


def test_asset_model_creation():
    """Test AssetModel fields and PlanType enum."""
    asset = AssetModel(
        type=AssetType.EFFECT,
        name="Glow Effect",
        required_plan=PlanType.PRO,
        engine_key="fx_glow_v1",
        category="filters",
    )
    assert asset.type == AssetType.EFFECT
    assert asset.name == "Glow Effect"
    assert asset.required_plan == PlanType.PRO
    assert asset.enabled is True
    assert asset.version == 1


def test_subscription_model_creation():
    """Test SubscriptionModel fields and status enum."""
    u_id = uuid4()
    sub = SubscriptionModel(user_id=u_id, plan=PlanType.PREMIUM, status=SubscriptionStatus.ACTIVE)
    assert sub.user_id == u_id
    assert sub.plan == PlanType.PREMIUM
    assert sub.status == SubscriptionStatus.ACTIVE


def test_credit_model_creation():
    """Test CreditModel balance defaults and credit mode."""
    u_id = uuid4()
    credit = CreditModel(user_id=u_id, balance=250, credit_mode="fast")
    assert credit.user_id == u_id
    assert credit.balance == 250
    assert credit.credit_mode == "fast"


def test_export_model_creation():
    """Test ExportModel fields and relationship IDs."""
    p_id = uuid4()
    u_id = uuid4()
    exp = ExportModel(project_id=p_id, user_id=u_id, resolution="4k", status=ExportStatus.PENDING)
    assert exp.project_id == p_id
    assert exp.user_id == u_id
    assert exp.resolution == "4k"
    assert exp.status == ExportStatus.PENDING
    assert exp.file_url is None


def test_sql_migration_file_integrity():
    """Test that the production SQL migration file exists and defines required tables, indexes, and RLS."""
    migration_path = Path(__file__).resolve().parent.parent / "supabase" / "migrations" / "20260731000000_create_production_schema.sql"
    assert migration_path.exists(), "SQL migration file missing"

    content = migration_path.read_text(encoding="utf-8")

    # Verify tables created
    for table_name in ["profiles", "projects", "assets", "subscriptions", "credits", "exports"]:
        assert f"CREATE TABLE IF NOT EXISTS public.{table_name}" in content

    # Verify RLS enabled
    for table_name in ["profiles", "projects", "assets", "subscriptions", "credits", "exports"]:
        assert f"ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY" in content

    # Verify Indexes created
    assert "CREATE INDEX IF NOT EXISTS idx_projects_user_id" in content
    assert "CREATE INDEX IF NOT EXISTS idx_exports_project_id" in content
