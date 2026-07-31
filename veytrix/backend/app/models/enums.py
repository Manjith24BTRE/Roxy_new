from enum import Enum


class PlanType(str, Enum):
    """Supported subscription plans."""

    FREE = "FREE"
    PRO = "PRO"
    PREMIUM = "PREMIUM"


class SubscriptionStatus(str, Enum):
    """Supported subscription statuses."""

    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    PAST_DUE = "past_due"
    PENDING = "pending"


class ProjectStatus(str, Enum):
    """Supported project statuses."""

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ExportStatus(str, Enum):
    """Supported export job statuses."""

    PENDING = "pending"
    QUEUED = "queued"
    RENDERING = "rendering"
    UPLOADING = "uploading"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AssetType(str, Enum):
    """Supported asset types across media and design catalogs."""

    IMAGE = "IMAGE"
    VIDEO = "VIDEO"
    AUDIO = "AUDIO"
    THUMBNAIL = "THUMBNAIL"
    EFFECT = "EFFECT"
    FILTER = "FILTER"
    TRANSITION = "TRANSITION"
    EXPORT = "EXPORT"


class AssetStatus(str, Enum):
    """Supported asset processing and availability statuses."""

    READY = "ready"
    PROCESSING = "processing"
    FAILED = "failed"
    DELETED = "deleted"
