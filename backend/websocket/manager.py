from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # We store active connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected via WebSocket. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, channel: str, message: Dict[str, Any]):
        """
        Broadcast a message to all connected clients.
        Expected format matches what frontend currently receives:
        { "channel": "events", "data": { ... } }
        """
        payload = {
            "channel": channel,
            "data": message
        }
        json_str = json.dumps(payload)
        
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json_str)
            except Exception as e:
                logger.error(f"Error sending to websocket: {e}")
                self.disconnect(connection)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect much from the client currently, but keep connection alive
            data = await websocket.receive_text()
            # Handle client-to-server messages if needed
            logger.debug(f"Received from WS client: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
