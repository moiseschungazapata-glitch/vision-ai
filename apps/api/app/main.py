from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from uuid import UUID, uuid4

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import RequestResponseEndpoint
from starlette.responses import Response

from vision_contracts import CONTRACT_VERSION

from .api.v1.router import router
from .auth.dependencies import AuthenticatedUser, require_site_member
from .config import get_settings
from .errors import AppError, app_error_handler
from .supabase import SupabaseGateway
from .websocket.manager import ConnectionManager


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    gateway = SupabaseGateway(settings)
    connections = ConnectionManager()
    gateway.connections = connections
    app.state.settings = settings
    app.state.supabase = gateway
    app.state.connections = connections
    yield
    await gateway.close()


app = FastAPI(
    title="VISION AI API",
    version=CONTRACT_VERSION,
    description="API REST y WebSocket conectada a Supabase para operación de VISION AI.",
    lifespan=lifespan,
)
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
app.add_exception_handler(AppError, app_error_handler)


@app.middleware("http")
async def request_context(request: Request, call_next: RequestResponseEndpoint) -> Response:
    request.state.request_id = request.headers.get("x-request-id", str(uuid4()))
    response = await call_next(request)
    response.headers["x-request-id"] = request.state.request_id
    response.headers["x-contract-version"] = CONTRACT_VERSION
    return response


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, error: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "code": "validation_error",
            "message": "Los datos enviados no cumplen el contrato.",
            "details": {"errors": error.errors()},
            "requestId": getattr(request.state, "request_id", str(uuid4())),
        },
    )


@app.get("/", include_in_schema=False)
async def root() -> dict[str, str]:
    return {"service": "VISION AI API", "docs": "/docs", "contractVersion": CONTRACT_VERSION}


@app.websocket("/ws/sites/{site_id}")
async def site_websocket(socket: WebSocket, site_id: UUID) -> None:
    token = socket.query_params.get("access_token")
    if not token:
        await socket.close(code=4401, reason="authentication_required")
        return
    gateway: SupabaseGateway = socket.app.state.supabase
    try:
        data = await gateway.authenticate(token)
        user = AuthenticatedUser(id=UUID(data["id"]), email=data.get("email"), access_token=token)
        await require_site_member(site_id, user, gateway)
    except AppError as error:
        await socket.close(code=4403 if error.status_code == 403 else 4401, reason=error.code)
        return

    manager: ConnectionManager = socket.app.state.connections
    await manager.connect(site_id, socket)
    try:
        await socket.send_json({
            "type": "connection.ready",
            "contractVersion": CONTRACT_VERSION,
            "siteId": str(site_id),
        })
        while True:
            message = await socket.receive_json()
            if message.get("type") == "ping":
                await socket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(site_id, socket)
