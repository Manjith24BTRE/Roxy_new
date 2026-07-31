from typing import Dict, List
from app.models.enums import AssetType, PlanType
from app.schemas.asset import CatalogItemResponse

# Pre-generated in-memory catalogs
_EFFECTS_CATALOG: List[CatalogItemResponse] = []
_FILTERS_CATALOG: List[CatalogItemResponse] = []
_TRANSITIONS_CATALOG: List[CatalogItemResponse] = []


def _generate_effects() -> List[CatalogItemResponse]:

    categories = [
        "Glitch", "Cinematic", "3D & VR", "Retro & Vintage", "Light & Flare",
        "Distortion", "Color Grade", "VHS & Analog", "Cyberpunk", "Blur & Bokeh",
        "Particle & Spark", "Duotone", "Thermal & Neon", "Motion Blur", "Split Screen"
    ]

    items: List[CatalogItemResponse] = []

    for i in range(1, 451):
        cat = categories[(i - 1) % len(categories)]
        plan = PlanType.FREE if i % 3 != 0 else (PlanType.PRO if i % 2 == 0 else PlanType.PREMIUM)
        engine_key = f"fx_engine_v1_{cat.lower().replace(' ', '_').replace('&', 'and')}_{i:03d}"
        
        items.append(
            CatalogItemResponse(
                id=f"fx-{i:03d}",
                name=f"{cat} Effect {i:03d}",
                type=AssetType.EFFECT,
                category=cat,
                thumbnail=f"https://assets.veytrix.ai/thumbnails/effects/fx_{i:03d}.webp",
                required_plan=plan,
                engine_key=engine_key,
                enabled=True,
                version=1,
                user_has_access=True,
                metadata={"preset_id": f"preset_fx_{i}", "intensity": 0.8},
            )
        )
    return items


def _generate_filters() -> List[CatalogItemResponse]:

    categories = [
        "Warm & Autumn", "Cool & Nordic", "Vintage Film", "Monochrome B&W",
        "High Dynamic", "Pastel Soft", "Dramatic Dark", "Moody Teal",
        "Sunset Glow", "Urban Cyber"
    ]

    items: List[CatalogItemResponse] = []

    for i in range(1, 201):
        cat = categories[(i - 1) % len(categories)]
        plan = PlanType.FREE if i % 4 != 0 else (PlanType.PRO if i % 2 == 0 else PlanType.PREMIUM)
        engine_key = f"fl_engine_v1_{cat.lower().replace(' ', '_').replace('&', 'and')}_{i:03d}"

        items.append(
            CatalogItemResponse(
                id=f"fl-{i:03d}",
                name=f"{cat} Filter {i:03d}",
                type=AssetType.FILTER,
                category=cat,
                thumbnail=f"https://assets.veytrix.ai/thumbnails/filters/fl_{i:03d}.webp",
                required_plan=plan,
                engine_key=engine_key,
                enabled=True,
                version=1,
                user_has_access=True,
                metadata={"lut_file": f"filter_{i}.cube", "contrast": 1.1},
            )
        )
    return items


def _generate_transitions() -> List[CatalogItemResponse]:

    categories = [
        "Zoom & Push", "Wipe & Slide", "Dissolve & Fade", "Glitch & Warp",
        "Spin & Rotate", "Blur & Flash", "3D Cube", "Light Leak",
        "Split & Shatter", "Morph"
    ]

    items: List[CatalogItemResponse] = []

    for i in range(1, 201):
        cat = categories[(i - 1) % len(categories)]
        plan = PlanType.FREE if i % 3 != 0 else (PlanType.PRO if i % 2 == 0 else PlanType.PREMIUM)
        engine_key = f"tr_engine_v1_{cat.lower().replace(' ', '_').replace('&', 'and')}_{i:03d}"

        items.append(
            CatalogItemResponse(
                id=f"tr-{i:03d}",
                name=f"{cat} Transition {i:03d}",
                type=AssetType.TRANSITION,
                category=cat,
                thumbnail=f"https://assets.veytrix.ai/thumbnails/transitions/tr_{i:03d}.webp",
                required_plan=plan,
                engine_key=engine_key,
                enabled=True,
                version=1,
                user_has_access=True,
                metadata={"default_duration_ms": 500, "easing": "cubic-bezier(0.4, 0, 0.2, 1)"},
            )
        )
    return items


def get_effects_catalog() -> List[CatalogItemResponse]:
    """Returns the cached list of 450 effects."""
    global _EFFECTS_CATALOG
    if not _EFFECTS_CATALOG:
        _EFFECTS_CATALOG = _generate_effects()
    return _EFFECTS_CATALOG


def get_filters_catalog() -> List[CatalogItemResponse]:
    """Returns the cached list of 200 filters."""
    global _FILTERS_CATALOG
    if not _FILTERS_CATALOG:
        _FILTERS_CATALOG = _generate_filters()
    return _FILTERS_CATALOG


def get_transitions_catalog() -> List[CatalogItemResponse]:
    """Returns the cached list of 200 transitions."""
    global _TRANSITIONS_CATALOG
    if not _TRANSITIONS_CATALOG:
        _TRANSITIONS_CATALOG = _generate_transitions()
    return _TRANSITIONS_CATALOG
