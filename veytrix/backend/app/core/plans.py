from dataclasses import dataclass
from typing import Dict
from app.models.enums import PlanType


@dataclass(frozen=True)
class PlanConfig:
    """Central configuration parameters for a subscription plan tier."""

    plan: PlanType
    level: int
    initial_credits: int
    credits_per_day: int
    max_projects: int
    max_export: str
    watermark_removal: bool
    custom_watermark: bool
    command_priority: str


# Resolution level hierarchy (higher int = higher capability)
RESOLUTION_LEVELS: Dict[str, int] = {
    "720p": 0,
    "1080p": 1,
    "2k": 2,
    "2K": 2,
    "4k": 3,
    "4K": 3,
}

# Plan level hierarchy
PLAN_LEVELS: Dict[PlanType, int] = {
    PlanType.FREE: 0,
    PlanType.PRO: 1,
    PlanType.PREMIUM: 2,
}

# Central Plan Configurations
PLAN_CONFIGS: Dict[PlanType, PlanConfig] = {
    PlanType.FREE: PlanConfig(
        plan=PlanType.FREE,
        level=0,
        initial_credits=250,
        credits_per_day=0,
        max_projects=3,
        max_export="720p",
        watermark_removal=False,
        custom_watermark=False,
        command_priority="standard",
    ),
    PlanType.PRO: PlanConfig(
        plan=PlanType.PRO,
        level=1,
        initial_credits=750,
        credits_per_day=75,
        max_projects=20,
        max_export="1080p",
        watermark_removal=True,
        custom_watermark=False,
        command_priority="high",
    ),
    PlanType.PREMIUM: PlanConfig(
        plan=PlanType.PREMIUM,
        level=2,
        initial_credits=1500,
        credits_per_day=150,
        max_projects=45,
        max_export="4K",
        watermark_removal=True,
        custom_watermark=True,
        command_priority="highest",
    ),
}


def get_plan_config(plan: PlanType) -> PlanConfig:
    """Get the central plan configuration object for a given plan type."""
    return PLAN_CONFIGS.get(plan, PLAN_CONFIGS[PlanType.FREE])


def is_plan_sufficient(user_plan: PlanType, required_plan: PlanType) -> bool:
    """Checks whether user's plan meets or exceeds the required plan tier."""
    from app.core.config import settings
    if getattr(settings, "DEVELOPER_MODE", False):
        return True
    user_level = PLAN_LEVELS.get(user_plan, 0)
    required_level = PLAN_LEVELS.get(required_plan, 0)
    return user_level >= required_level

