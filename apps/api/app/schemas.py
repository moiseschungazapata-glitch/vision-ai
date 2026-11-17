from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from vision_contracts import EventStatus, Severity, UseCase


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(word.title() for word in rest)


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class Site(ApiModel):
    id: UUID
    name: str
    timezone: str
    created_at: datetime
    updated_at: datetime


class SiteCreate(ApiModel):
    name: str = Field(min_length=1, max_length=120)
    timezone: str = "America/Lima"


class EdgeNode(ApiModel):
    id: UUID
    site_id: UUID
    name: str
    status: Literal["online", "degraded", "offline"]
    last_seen_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class EdgeNodeRegister(ApiModel):
    id: UUID
    site_id: UUID
    name: str = Field(min_length=1, max_length=120)


class CameraCreate(ApiModel):
    site_id: UUID
    name: str = Field(min_length=1, max_length=80)
    location: str = Field(min_length=1, max_length=160)
    source_type: Literal["usb", "rtsp"]
    source_ref: str = Field(min_length=1)
    active_profile: UseCase


class CameraUpdate(ApiModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    location: str | None = Field(default=None, min_length=1, max_length=160)
    enabled: bool | None = None
    active_profile: UseCase | None = None


class SessionStart(ApiModel):
    camera_id: UUID
    edge_node_id: UUID
    use_case: UseCase


class EventReviewCreate(ApiModel):
    decision: Literal["confirmed", "false_positive", "dismissed", "escalated"]
    comment: str | None = Field(default=None, max_length=2000)


RuleType = Literal[
    "ppe_missing", "restricted_zone", "dwell_time", "quality_defect",
    "missing_part", "occupancy", "queue", "congestion", "wrong_way",
    "vehicle_access",
]


class RuleCreate(ApiModel):
    site_id: UUID
    name: str = Field(min_length=1, max_length=120)
    use_case: UseCase
    rule_type: RuleType
    enabled: bool = True
    parameters: dict[str, Any] = Field(default_factory=dict)


class ReportCreate(ApiModel):
    site_id: UUID
    report_date: date
    timezone: str = "America/Lima"
    recipients: list[str] = Field(min_length=1)


class EdgeEventCreate(ApiModel):
    site_id: UUID
    session_id: UUID
    camera_id: UUID
    use_case: UseCase
    rule_id: UUID
    event_type: str = Field(min_length=1)
    title: str = Field(min_length=1, max_length=160)
    severity: Severity
    occurred_at: datetime
    ended_at: datetime | None = None
    duration_ms: int | None = Field(default=None, ge=0)
    confidence: float = Field(ge=0, le=1)
    track_ids: list[str] = Field(default_factory=list)
    zone_id: UUID | None = None
    evidence_path: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class TelemetryCreate(ApiModel):
    edge_node_id: UUID
    camera_id: UUID
    session_id: UUID | None = None
    timestamp: datetime
    connection_status: Literal["online", "degraded", "offline"]
    fps: float = Field(ge=0)
    latency_ms: float = Field(ge=0)
    inference_ms: float = Field(ge=0)
    dropped_frames_percent: float = Field(ge=0, le=100)
    gpu_utilization_percent: float | None = Field(default=None, ge=0, le=100)
    temperature_celsius: float | None = None
    active_detections: int = Field(ge=0)


class EdgeSessionUpdate(ApiModel):
    status: Literal["running", "paused", "stopped", "failed"]
    ended_at: datetime | None = None
    failure_reason: str | None = Field(default=None, max_length=500)


class EdgeCameraStatus(ApiModel):
    status: Literal["online", "degraded", "offline"]


class Page[ItemT](ApiModel):
    items: list[ItemT]
    page: int
    page_size: int
    total_items: int
    total_pages: int


class EventFilters(ApiModel):
    status: EventStatus | None = None
    severity: Severity | None = None
    use_case: UseCase | None = None
