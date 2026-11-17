import asyncio
from collections import defaultdict
from datetime import UTC, datetime
from typing import Any
from uuid import UUID, uuid4

from fastapi import WebSocket

from vision_contracts import CONTRACT_VERSION


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[UUID, set[WebSocket]] = defaultdict(set)
        self._sequences: dict[UUID, int] = defaultdict(int)
        self._lock = asyncio.Lock()

    async def connect(self, site_id: UUID, socket: WebSocket) -> None:
        await socket.accept()
        async with self._lock:
            self._connections[site_id].add(socket)

    async def disconnect(self, site_id: UUID, socket: WebSocket) -> None:
        async with self._lock:
            self._connections[site_id].discard(socket)
            if not self._connections[site_id]:
                self._connections.pop(site_id, None)

    async def publish(self, site_id: UUID, message_type: str, payload: dict[str, Any]) -> None:
        async with self._lock:
            self._sequences[site_id] += 1
            sequence = self._sequences[site_id]
            sockets = tuple(self._connections.get(site_id, set()))
        envelope = {
            "contractVersion": CONTRACT_VERSION,
            "messageId": str(uuid4()),
            "type": message_type,
            "siteId": str(site_id),
            "sequence": sequence,
            "occurredAt": datetime.now(UTC).isoformat(),
            "payload": payload,
        }
        disconnected: list[WebSocket] = []
        for socket in sockets:
            try:
                await socket.send_json(envelope)
            except RuntimeError:
                disconnected.append(socket)
        for socket in disconnected:
            await self.disconnect(site_id, socket)
