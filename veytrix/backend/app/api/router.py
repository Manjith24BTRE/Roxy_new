from fastapi import APIRouter
from app.api.endpoints import assets, auth, exports, health, projects, settings, subscriptions, workspaces

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["Workspaces"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
api_router.include_router(assets.router, prefix="/assets", tags=["Assets"])
api_router.include_router(exports.router, prefix="/exports", tags=["Exports"])
