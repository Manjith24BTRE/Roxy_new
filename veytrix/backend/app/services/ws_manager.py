"""WebSocket connection manager for broadcasting export lifecycle and real-time progress updates to connected clients."""

import asyncio
from typing import Dict, List, Set, Optional
from uuid import UUID
from fastapi import WebSocket, WebSocketDisconnect
from app.core.logging import logger


class ConnectionManager:
    """Production WebSocket connection manager supporting per-user and per-export channel subscriptions."""

    def __init__(self):
        # Map user_id -> Set[WebSocket]
        self._user_connections: Dict[str, Set[WebSocket]] = {}
        # Map export_id -> Set[WebSocket]
        self._export_connections: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, user_id: str, export_id: Optional[str] = None):
        """Accepts WebSocket connection and registers subscriptions."""
        await websocket.accept()
        async with self._lock:
            if user_id not in self._user_connections:
                self._user_connections[user_id] = set()
            self._user_connections[user_id].add(websocket)

            if export_id:
                if export_id not in self._export_connections:
                    self._export_connections[export_id] = set()
                self._export_connections[export_id].add(websocket)

        logger.info(f"WebSocket connected for user '{user_id}' (export_id: '{export_id}')")

    async def disconnect(self, websocket: WebSocket, user_id: str, export_id: Optional[str] = None):
        """Removes WebSocket connection upon disconnect."""
        async with self._lock:
            if user_id in self._user_connections:
                self._user_connections[user_id].discard(websocket)
                if not self._user_connections[user_id]:
                    del self._user_connections[user_id]

            if export_id and export_id in self._export_connections:
                self._export_connections[export_id].discard(websocket)
                if not self._export_connections[export_id]:
                    del self._export_connections[export_id]

        logger.info(f"WebSocket disconnected for user '{user_id}'")

    async def broadcast_to_user(self, user_id: str, message: dict):
        """Broadcasts event payload to all active WebSocket connections of a user."""
        connections = list(self._user_connections.get(user_id, set()))
        for ws in connections:
            try:
                await ws.send_json(message)
            except Exception as exc:
                logger.warning(f"Error broadcasting WebSocket message to user {user_id}: {exc}")
                await self.disconnect(ws, user_id)

    async def broadcast_to_export(self, export_id: str, message: dict):
        """Broadcasts event payload to subscribers of a specific export job."""
        connections = list(self._export_connections.get(export_id, set()))
        for ws in connections:
            try:
                await ws.send_json(message)
            except Exception as exc:
                logger.warning(f"Error broadcasting WebSocket message for export {export_id}: {exc}")
                await self.disconnect(ws, "", export_id)


ws_manager = ConnectionManager()
