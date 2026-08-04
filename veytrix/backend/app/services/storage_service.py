import os
import urllib.request
from typing import Dict, Optional, Tuple, Union
from uuid import uuid4
from fastapi import HTTPException, UploadFile, status
from app.core.config import settings
from app.core.logging import logger
from app.core.supabase import get_supabase_admin_client
from app.models.enums import AssetType

# Maximum allowed file sizes (in bytes)
MAX_FILE_SIZES: Dict[AssetType, int] = {
    AssetType.IMAGE: 10 * 1024 * 1024,      # 10 MB
    AssetType.THUMBNAIL: 10 * 1024 * 1024,  # 10 MB
    AssetType.AUDIO: 50 * 1024 * 1024,      # 50 MB
    AssetType.VIDEO: 500 * 1024 * 1024,     # 500 MB
    AssetType.EXPORT: 500 * 1024 * 1024,    # 500 MB
}

# Content-type (MIME type) whitelists
ALLOWED_MIME_TYPES: Dict[AssetType, Tuple[str, ...]] = {
    AssetType.IMAGE: (
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
    ),
    AssetType.THUMBNAIL: (
        "image/jpeg",
        "image/png",
        "image/webp",
    ),
    AssetType.AUDIO: (
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/aac",
        "audio/ogg",
        "audio/flac",
    ),
    AssetType.VIDEO: (
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
    ),
    AssetType.EXPORT: (
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "image/gif",
    ),
}

# Bucket routing by asset type
BUCKET_ROUTING: Dict[AssetType, str] = {
    AssetType.IMAGE: "images",
    AssetType.VIDEO: "videos",
    AssetType.AUDIO: "audio",
    AssetType.THUMBNAIL: "thumbnails",
    AssetType.EXPORT: "exports",
    AssetType.EFFECT: "assets",
    AssetType.FILTER: "assets",
    AssetType.TRANSITION: "assets",
}


class StorageService:
    """Service providing unified storage operations over Supabase Storage buckets."""

    def __init__(self):
        self.supabase = get_supabase_admin_client()

    def validate_file(self, file: UploadFile, asset_type: AssetType, file_bytes: bytes) -> None:
        """Validates file MIME type and maximum size constraints."""
        allowed_mimes = ALLOWED_MIME_TYPES.get(asset_type)
        if allowed_mimes and file.content_type not in allowed_mimes:
            logger.warning(f"File validation failed: invalid content-type {file.content_type} for {asset_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '{file.content_type}' for {asset_type.value}. Allowed: {', '.join(allowed_mimes)}",
            )

        max_size = MAX_FILE_SIZES.get(asset_type, 100 * 1024 * 1024)
        if len(file_bytes) > max_size:
            max_mb = max_size // (1024 * 1024)
            logger.warning(f"File validation failed: file size {len(file_bytes)} exceeds limit {max_size}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum limit of {max_mb} MB for {asset_type.value}",
            )

    def get_bucket_for_type(self, asset_type: Union[AssetType, str]) -> str:
        """Returns target Supabase Storage bucket name for an asset type or bucket string."""
        if isinstance(asset_type, AssetType):
            return BUCKET_ROUTING.get(asset_type, "assets")

        val_str = str(asset_type).lower().replace("assettype.", "")
        if "video" in val_str:
            return "videos"
        elif "image" in val_str:
            return "images"
        elif "audio" in val_str:
            return "audio"
        elif "export" in val_str:
            return "exports"
        elif "thumbnail" in val_str:
            return "thumbnails"
        elif val_str in ("assets", "images", "videos", "audio", "thumbnails", "exports"):
            return val_str
        return "assets"

    async def upload_file(
        self,
        file: UploadFile,
        asset_type: AssetType,
        user_id: str,
        custom_filename: Optional[str] = None,
    ) -> Tuple[str, str]:
        """Uploads file to Supabase Storage bucket and returns (file_url, storage_path)."""
        file_bytes = await file.read()
        self.validate_file(file, asset_type, file_bytes)

        bucket_name = self.get_bucket_for_type(asset_type)
        safe_filename = custom_filename or file.filename or "file.bin"
        extension = os.path.splitext(safe_filename)[1]
        unique_name = f"{uuid4()}{extension}"
        storage_path = f"{user_id}/{asset_type.value.lower()}/{unique_name}"

        file_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{storage_path}"
        uploaded = False

        if self.supabase:
            try:
                self.supabase.storage.from_(bucket_name).upload(
                    path=storage_path,
                    file=file_bytes,
                    file_options={"content-type": file.content_type or "application/octet-stream", "upsert": "true"},
                )
                uploaded = True
                logger.info(f"Successfully uploaded file to Supabase storage bucket '{bucket_name}' at path '{storage_path}'")
            except Exception as exc:
                logger.warning(f"Supabase SDK upload failed ({exc}). Trying HTTP REST upload fallback.")

        if not uploaded and settings.SUPABASE_URL:
            try:
                upload_endpoint = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket_name}/{storage_path}"
                auth_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
                headers = {
                    "Authorization": f"Bearer {auth_key}",
                    "Content-Type": file.content_type or "application/octet-stream",
                    "x-upsert": "true",
                }
                req = urllib.request.Request(upload_endpoint, data=file_bytes, headers=headers, method="POST")
                with urllib.request.urlopen(req, timeout=60) as resp:
                    if resp.status in (200, 201):
                        uploaded = True
                        logger.info(f"Successfully uploaded file via HTTP REST to Supabase storage '{bucket_name}/{storage_path}'")
            except Exception as exc:
                logger.error(f"Supabase HTTP REST upload error: {exc}")

        return file_url, storage_path

    async def upload_file_path(
        self,
        local_file_path: str,
        bucket_name: str,
        storage_path: str,
        content_type: str = "video/mp4",
    ) -> Tuple[str, str]:
        """Uploads a local filesystem file to Supabase Storage bucket and returns (file_url, storage_path)."""
        file_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{storage_path}"

        if os.path.exists(local_file_path):
            with open(local_file_path, "rb") as f:
                file_bytes = f.read()

            uploaded = False
            if self.supabase:
                try:
                    self.supabase.storage.from_(bucket_name).upload(
                        path=storage_path,
                        file=file_bytes,
                        file_options={"content-type": content_type, "upsert": "true"},
                    )
                    uploaded = True
                    logger.info(f"Uploaded rendered export via SDK to Supabase storage '{bucket_name}/{storage_path}'")
                except Exception as exc:
                    logger.warning(f"Supabase SDK upload failed ({exc}). Trying HTTP REST upload fallback.")

            if not uploaded and settings.SUPABASE_URL:
                try:
                    upload_endpoint = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket_name}/{storage_path}"
                    auth_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
                    headers = {
                        "Authorization": f"Bearer {auth_key}",
                        "Content-Type": content_type,
                        "x-upsert": "true",
                    }
                    req = urllib.request.Request(upload_endpoint, data=file_bytes, headers=headers, method="POST")
                    with urllib.request.urlopen(req, timeout=60) as resp:
                        if resp.status in (200, 201):
                            uploaded = True
                            logger.info(f"Uploaded rendered export via HTTP REST to Supabase storage '{bucket_name}/{storage_path}'")
                except Exception as exc:
                    logger.error(f"Supabase HTTP REST export upload error: {exc}")

        return file_url, storage_path

    def delete_file(self, storage_path: str, asset_type_or_bucket: Union[AssetType, str]) -> bool:
        """Deletes file from storage bucket. Accepts AssetType enum or bucket name string."""
        if not storage_path:
            return False

        bucket_name = self.get_bucket_for_type(asset_type_or_bucket)
        if self.supabase:
            try:
                self.supabase.storage.from_(bucket_name).remove([storage_path])
                logger.info(f"Successfully deleted file '{storage_path}' from bucket '{bucket_name}'")
                return True
            except Exception as exc:
                logger.error(f"Failed to delete file '{storage_path}' from bucket '{bucket_name}': {exc}")
                return False
        return True
