from __future__ import annotations

from datetime import UTC, datetime
from math import ceil
from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, Response, status

from vision_contracts import (
    CONTRACT_VERSION,
    Camera,
    DailyReport,
    EdgeTelemetry,
    EventReview,
    EventStatus,
    Severity,
    UseCase,
    VisionEvent,
    VisionRule,
    VisionSession,
)

from ...auth.dependencies import (
    AuthenticatedUser,
    get_current_user,
    get_gateway,
    require_edge_token,
    require_site_member,
)
from ...config import Settings, get_settings
from ...errors import AppError
from ...schemas import (
    CameraCreate,
    CameraUpdate,
    EdgeCameraStatus,
    EdgeEventCreate,
    EdgeNode,
    EdgeNodeRegister,
    EdgeSessionUpdate,
    EventReviewCreate,
    Page,
    ReportCreate,
    RuleCreate,
    SessionStart,
    Site,
    SiteCreate,
    TelemetryCreate,
)
from ...supabase import SupabaseGateway

router = APIRouter(prefix="/api/v1")
CurrentUser = Annotated[AuthenticatedUser, Depends(get_current_user)]
Gateway = Annotated[SupabaseGateway, Depends(get_gateway)]


def db_payload(model: Any, **extra: Any) -> dict[str, Any]:
    return {**model.model_dump(mode="json", by_alias=False, exclude_none=True), **extra}


def without(row: dict[str, Any], *keys: str) -> dict[str, Any]:
    return {key: value for key, value in row.items() if key not in keys}


def page_result(rows: list[Any], page: int, page_size: int, total: int | None) -> Page[Any]:
    count = total if total is not None else len(rows)
    return Page(
        items=rows,
        page=page,
        page_size=page_size,
        total_items=count,
        total_pages=ceil(count / page_size) if count else 0,
    )


async def member(site_id: UUID, user: AuthenticatedUser, gateway: SupabaseGateway) -> None:
    await require_site_member(site_id, user, gateway)


@router.get("/health", tags=["system"])
async def health(request: Request) -> dict[str, str]:
    configured = request.app.state.settings.supabase_configured
    return {
        "status": "ok" if configured else "degraded",
        "contractVersion": CONTRACT_VERSION,
        "database": "configured" if configured else "not_configured",
    }


@router.get("/sites", response_model=list[Site], tags=["sites"])
async def list_sites(user: CurrentUser, gateway: Gateway) -> list[Site]:
    rows, _ = await gateway.rows(
        "sites",
        access_token=user.access_token,
        params={"select": "*", "order": "name.asc"},
    )
    return [Site.model_validate(row) for row in rows]


@router.post("/sites", response_model=Site, status_code=201, tags=["sites"])
async def create_site(body: SiteCreate, user: CurrentUser, gateway: Gateway) -> Site:
    result = await gateway.rpc(
        "create_site_with_owner",
        {"p_name": body.name, "p_timezone": body.timezone},
        access_token=user.access_token,
    )
    row = result[0] if isinstance(result, list) else result
    return Site.model_validate(row)


@router.get("/cameras", response_model=Page[Camera], tags=["cameras"])
async def list_cameras(
    site_id: Annotated[UUID, Query(alias="siteId")],
    user: CurrentUser,
    gateway: Gateway,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 25,
) -> Page[Camera]:
    await member(site_id, user, gateway)
    rows, total = await gateway.rows(
        "cameras",
        access_token=user.access_token,
        params={
            "select": "*",
            "site_id": f"eq.{site_id}",
            "order": "created_at.desc",
            "limit": page_size,
            "offset": (page - 1) * page_size,
        },
        count=True,
    )
    return page_result([Camera.model_validate(row) for row in rows], page, page_size, total)


@router.post("/cameras", response_model=Camera, status_code=201, tags=["cameras"])
async def create_camera(body: CameraCreate, user: CurrentUser, gateway: Gateway) -> Camera:
    await member(body.site_id, user, gateway)
    row = await gateway.insert(
        "cameras",
        db_payload(body, enabled=True, status="offline"),
        access_token=user.access_token,
    )
    camera = Camera.model_validate(row)
    await gateway_insert_broadcast(gateway, body.site_id, "camera.status_changed", camera, user)
    return camera


@router.get("/cameras/{camera_id}", response_model=Camera, tags=["cameras"])
async def get_camera(camera_id: UUID, user: CurrentUser, gateway: Gateway) -> Camera:
    row = await gateway.one(
        "cameras",
        access_token=user.access_token,
        params={"select": "*", "id": f"eq.{camera_id}"},
    )
    await member(UUID(row["site_id"]), user, gateway)
    return Camera.model_validate(row)


@router.patch("/cameras/{camera_id}", response_model=Camera, tags=["cameras"])
async def update_camera(
    camera_id: UUID,
    body: CameraUpdate,
    user: CurrentUser,
    gateway: Gateway,
) -> Camera:
    existing = await get_camera(camera_id, user, gateway)
    changes = body.model_dump(mode="json", by_alias=False, exclude_none=True)
    if not changes:
        raise AppError(422, "empty_update", "Debes indicar al menos un campo para actualizar.")
    row = await gateway.update(
        "cameras",
        changes,
        access_token=user.access_token,
        params={"id": f"eq.{camera_id}"},
    )
    camera = Camera.model_validate(row)
    await gateway_insert_broadcast(gateway, existing.site_id, "camera.status_changed", camera, user)
    return camera


@router.delete("/cameras/{camera_id}", status_code=204, tags=["cameras"])
async def delete_camera(camera_id: UUID, user: CurrentUser, gateway: Gateway) -> Response:
    await get_camera(camera_id, user, gateway)
    await gateway.delete(
        "cameras",
        access_token=user.access_token,
        params={"id": f"eq.{camera_id}"},
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/sessions", response_model=Page[VisionSession], tags=["sessions"])
async def list_sessions(
    site_id: Annotated[UUID, Query(alias="siteId")],
    user: CurrentUser,
    gateway: Gateway,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 25,
) -> Page[VisionSession]:
    await member(site_id, user, gateway)
    rows, total = await gateway.rows(
        "vision_sessions",
        access_token=user.access_token,
        params={
            "select": "*,cameras!inner(site_id)",
            "cameras.site_id": f"eq.{site_id}",
            "order": "started_at.desc",
            "limit": page_size,
            "offset": (page - 1) * page_size,
        },
        count=True,
    )
    cleaned = [{key: value for key, value in row.items() if key != "cameras"} for row in rows]
    sessions = [VisionSession.model_validate(row) for row in cleaned]
    return page_result(sessions, page, page_size, total)


@router.post("/sessions", response_model=VisionSession, status_code=202, tags=["sessions"])
async def start_session(
    body: SessionStart,
    user: CurrentUser,
    gateway: Gateway,
    settings: Annotated[Settings, Depends(get_settings)],
) -> VisionSession:
    camera = await get_camera(body.camera_id, user, gateway)
    row = await gateway.insert(
        "vision_sessions",
        db_payload(
            body,
            status="starting",
            model_version=settings.default_model_version,
            rule_set_version=settings.default_rule_set_version,
        ),
        access_token=user.access_token,
    )
    session = VisionSession.model_validate(row)
    await gateway_insert_broadcast(gateway, camera.site_id, "session.status_changed", session, user)
    return session


@router.post(
    "/sessions/{session_id}/stop",
    response_model=VisionSession,
    status_code=202,
    tags=["sessions"],
)
async def stop_session(session_id: UUID, user: CurrentUser, gateway: Gateway) -> VisionSession:
    existing = await gateway.one(
        "vision_sessions",
        access_token=user.access_token,
        params={"select": "*,cameras!inner(site_id)", "id": f"eq.{session_id}"},
    )
    site_id = UUID(existing["cameras"]["site_id"])
    await member(site_id, user, gateway)
    row = await gateway.update(
        "vision_sessions",
        {"status": "stopping"},
        access_token=user.access_token,
        params={"id": f"eq.{session_id}"},
    )
    session = VisionSession.model_validate(row)
    await gateway_insert_broadcast(gateway, site_id, "session.status_changed", session, user)
    return session


@router.get("/events", response_model=Page[VisionEvent], tags=["events"])
async def list_events(
    site_id: Annotated[UUID, Query(alias="siteId")],
    user: CurrentUser,
    gateway: Gateway,
    event_status: Annotated[EventStatus | None, Query(alias="status")] = None,
    severity: Severity | None = None,
    use_case: Annotated[UseCase | None, Query(alias="useCase")] = None,
    from_time: Annotated[datetime | None, Query(alias="from")] = None,
    to_time: Annotated[datetime | None, Query(alias="to")] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 25,
) -> Page[VisionEvent]:
    await member(site_id, user, gateway)
    params: dict[str, Any] = {
        "select": "*",
        "site_id": f"eq.{site_id}",
        "order": "occurred_at.desc",
        "limit": page_size,
        "offset": (page - 1) * page_size,
    }
    if event_status:
        params["status"] = f"eq.{event_status.value}"
    if severity:
        params["severity"] = f"eq.{severity.value}"
    if use_case:
        params["use_case"] = f"eq.{use_case.value}"
    if from_time:
        params["occurred_at"] = f"gte.{from_time.isoformat()}"
    if to_time:
        params["and"] = f"(occurred_at.lte.{to_time.isoformat()})"
    rows, total = await gateway.rows(
        "vision_events",
        access_token=user.access_token,
        params=params,
        count=True,
    )
    events = [VisionEvent.model_validate(without(row, "created_at")) for row in rows]
    return page_result(events, page, page_size, total)


@router.get("/events/{event_id}", response_model=VisionEvent, tags=["events"])
async def get_event(event_id: UUID, user: CurrentUser, gateway: Gateway) -> VisionEvent:
    row = await gateway.one(
        "vision_events",
        access_token=user.access_token,
        params={"select": "*", "id": f"eq.{event_id}"},
    )
    await member(UUID(row["site_id"]), user, gateway)
    return VisionEvent.model_validate(without(row, "created_at"))


@router.post(
    "/events/{event_id}/reviews",
    response_model=EventReview,
    status_code=201,
    tags=["events"],
)
async def review_event(
    event_id: UUID,
    body: EventReviewCreate,
    user: CurrentUser,
    gateway: Gateway,
) -> EventReview:
    event = await get_event(event_id, user, gateway)
    result = await gateway.rpc(
        "review_vision_event",
        {
            "p_event_id": str(event_id),
            "p_decision": body.decision,
            "p_comment": body.comment,
        },
        access_token=user.access_token,
    )
    review_data = result[0] if isinstance(result, list) else result
    review = EventReview.model_validate(review_data)
    updated = await get_event(event_id, user, gateway)
    await gateway_insert_broadcast(gateway, event.site_id, "event.updated", updated, user)
    return review


@router.post(
    "/edge/events",
    response_model=VisionEvent,
    status_code=201,
    tags=["edge"],
    dependencies=[Depends(require_edge_token)],
)
@router.post(
    "/ingest/events",
    response_model=VisionEvent,
    status_code=202,
    tags=["edge"],
    dependencies=[Depends(require_edge_token)],
)
async def ingest_event(body: EdgeEventCreate, request: Request, gateway: Gateway) -> VisionEvent:
    row = await gateway.insert("vision_events", db_payload(body, status="new"))
    event = VisionEvent.model_validate(without(row, "created_at"))
    await request.app.state.connections.publish(
        body.site_id,
        "event.created",
        event.model_dump(mode="json", by_alias=True),
    )
    return event


@router.patch(
    "/edge/cameras/{camera_id}/status",
    response_model=Camera,
    tags=["edge"],
    dependencies=[Depends(require_edge_token)],
)
async def update_camera_status(
    camera_id: UUID,
    body: EdgeCameraStatus,
    request: Request,
    gateway: Gateway,
) -> Camera:
    row = await gateway.update(
        "cameras",
        db_payload(body),
        access_token=None,
        params={"id": f"eq.{camera_id}"},
    )
    camera = Camera.model_validate(row)
    await request.app.state.connections.publish(
        camera.site_id,
        "camera.status_changed",
        camera.model_dump(mode="json", by_alias=True),
    )
    return camera


@router.patch(
    "/edge/sessions/{session_id}",
    response_model=VisionSession,
    tags=["edge"],
    dependencies=[Depends(require_edge_token)],
)
async def update_session_status(
    session_id: UUID,
    body: EdgeSessionUpdate,
    request: Request,
    gateway: Gateway,
) -> VisionSession:
    existing = await gateway.one(
        "vision_sessions",
        access_token=None,
        params={"select": "camera_id", "id": f"eq.{session_id}"},
    )
    camera = await gateway.one(
        "cameras",
        access_token=None,
        params={"select": "site_id", "id": f"eq.{existing['camera_id']}"},
    )
    row = await gateway.update(
        "vision_sessions",
        db_payload(body),
        access_token=None,
        params={"id": f"eq.{session_id}"},
    )
    session = VisionSession.model_validate(row)
    await request.app.state.connections.publish(
        UUID(camera["site_id"]),
        "session.status_changed",
        session.model_dump(mode="json", by_alias=True),
    )
    return session


@router.post(
    "/edge/nodes/register",
    response_model=EdgeNode,
    tags=["edge"],
    dependencies=[Depends(require_edge_token)],
)
async def register_edge_node(body: EdgeNodeRegister, gateway: Gateway) -> EdgeNode:
    row = await gateway.upsert(
        "edge_nodes",
        db_payload(body, status="online", last_seen_at=datetime.now(UTC).isoformat()),
    )
    return EdgeNode.model_validate(row)


@router.get("/rules", response_model=list[VisionRule], tags=["rules"])
async def list_rules(
    site_id: Annotated[UUID, Query(alias="siteId")],
    user: CurrentUser,
    gateway: Gateway,
) -> list[VisionRule]:
    await member(site_id, user, gateway)
    rows, _ = await gateway.rows(
        "vision_rules",
        access_token=user.access_token,
        params={"select": "*", "site_id": f"eq.{site_id}", "order": "created_at.desc"},
    )
    return [VisionRule.model_validate(row) for row in rows]


@router.post("/rules", response_model=VisionRule, status_code=201, tags=["rules"])
async def create_rule(body: RuleCreate, user: CurrentUser, gateway: Gateway) -> VisionRule:
    role = await require_site_member(body.site_id, user, gateway)
    if role not in {"owner", "admin", "operator"}:
        raise AppError(403, "insufficient_role", "Tu rol no permite crear reglas.")
    row = await gateway.insert(
        "vision_rules",
        db_payload(body, version=1),
        access_token=user.access_token,
    )
    return VisionRule.model_validate(row)


@router.get("/telemetry/latest", response_model=list[EdgeTelemetry], tags=["telemetry"])
async def latest_telemetry(
    site_id: Annotated[UUID, Query(alias="siteId")],
    user: CurrentUser,
    gateway: Gateway,
) -> list[EdgeTelemetry]:
    await member(site_id, user, gateway)
    rows, _ = await gateway.rows(
        "edge_telemetry",
        access_token=user.access_token,
        params={
            "select": "*,cameras!inner(site_id)",
            "cameras.site_id": f"eq.{site_id}",
            "order": "timestamp.desc",
            "limit": 500,
        },
    )
    latest: dict[str, EdgeTelemetry] = {}
    for row in rows:
        clean = without(row, "cameras", "id")
        latest.setdefault(row["camera_id"], EdgeTelemetry.model_validate(clean))
    return list(latest.values())


@router.post(
    "/edge/telemetry",
    response_model=EdgeTelemetry,
    status_code=201,
    tags=["edge"],
    dependencies=[Depends(require_edge_token)],
)
@router.post(
    "/ingest/telemetry",
    response_model=EdgeTelemetry,
    status_code=202,
    tags=["edge"],
    dependencies=[Depends(require_edge_token)],
)
async def ingest_telemetry(
    body: TelemetryCreate,
    request: Request,
    gateway: Gateway,
) -> EdgeTelemetry:
    camera = await gateway.one(
        "cameras",
        access_token=None,
        params={"select": "site_id", "id": f"eq.{body.camera_id}"},
    )
    row = await gateway.insert("edge_telemetry", db_payload(body))
    telemetry = EdgeTelemetry.model_validate(without(row, "id"))
    await request.app.state.connections.publish(
        UUID(camera["site_id"]),
        "telemetry.updated",
        telemetry.model_dump(mode="json", by_alias=True),
    )
    return telemetry


@router.get("/reports", response_model=Page[DailyReport], tags=["reports"])
async def list_reports(
    site_id: Annotated[UUID, Query(alias="siteId")],
    user: CurrentUser,
    gateway: Gateway,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 25,
) -> Page[DailyReport]:
    await member(site_id, user, gateway)
    rows, total = await gateway.rows(
        "daily_reports",
        access_token=user.access_token,
        params={
            "select": "*",
            "site_id": f"eq.{site_id}",
            "order": "report_date.desc",
            "limit": page_size,
            "offset": (page - 1) * page_size,
        },
        count=True,
    )
    reports = [DailyReport.model_validate(without(row, "created_at")) for row in rows]
    return page_result(reports, page, page_size, total)


@router.post("/reports", response_model=DailyReport, status_code=202, tags=["reports"])
async def generate_report(body: ReportCreate, user: CurrentUser, gateway: Gateway) -> DailyReport:
    await member(body.site_id, user, gateway)
    event_rows, total = await gateway.rows(
        "vision_events",
        access_token=user.access_token,
        params={
            "select": "id",
            "site_id": f"eq.{body.site_id}",
            "occurred_at": f"gte.{body.report_date.isoformat()}T00:00:00",
            "limit": 1,
        },
        count=True,
    )
    del event_rows
    row = await gateway.insert(
        "daily_reports",
        db_payload(body, status="pending", event_count=total or 0, metrics={}),
        access_token=user.access_token,
    )
    return DailyReport.model_validate(without(row, "created_at"))


async def gateway_insert_broadcast(
    gateway: SupabaseGateway,
    site_id: UUID,
    message_type: str,
    model: Any,
    user: AuthenticatedUser,
) -> None:
    del user
    if gateway.connections is not None:
        await gateway.connections.publish(
            site_id,
            message_type,
            model.model_dump(mode="json", by_alias=True),
        )
